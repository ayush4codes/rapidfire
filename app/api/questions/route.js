import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/lib/models/Question';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    // Fetch all questions and shuffle them
    const questions = await Question.aggregate([
      { $sample: { size: 40 } },
      {
        $project: {
          question: 1,
          options: 1,
          timeLimit: 1,
          // Do NOT send correctAnswer to client
        },
      },
    ]);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found. Please seed the database first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
