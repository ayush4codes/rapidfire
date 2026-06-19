import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/lib/models/Question';
import Result from '@/lib/models/Result';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, answers } = await request.json();

    if (!userId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'userId and answers array are required' },
        { status: 400 }
      );
    }

    // Verify user exists and hasn't already attempted
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.hasAttempted) {
      return NextResponse.json(
        { error: 'Quiz already attempted' },
        { status: 403 }
      );
    }

    // Fetch correct answers from DB
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q.correctAnswer;
    });

    // Grade answers server-side
    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const correctAnswer = questionMap[a.questionId];
      const isCorrect = a.selectedOption === correctAnswer;
      if (isCorrect) score++;
      return {
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect,
        timeTaken: a.timeTaken || 15000,
      };
    });

    // Save result
    const result = await Result.create({
      userId,
      score,
      totalQuestions: answers.length,
      answers: gradedAnswers,
    });

    // Mark user as attempted
    user.hasAttempted = true;
    await user.save();

    // Return results with question details for review
    const detailedResults = answers.map((a, index) => {
      const question = questions.find(
        (q) => q._id.toString() === a.questionId
      );
      return {
        question: question?.question,
        options: question?.options,
        selectedOption: a.selectedOption,
        correctAnswer: question?.correctAnswer,
        isCorrect: gradedAnswers[index].isCorrect,
        timeTaken: a.timeTaken,
      };
    });

    return NextResponse.json({
      success: true,
      resultId: result._id,
      score,
      totalQuestions: answers.length,
      details: detailedResults,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    );
  }
}
