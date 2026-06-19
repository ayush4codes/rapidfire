import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Question from '@/lib/models/Question';
import questionsData from '@/data/questions.json';

export async function POST(request) {
  try {
    const { secret } = await request.json();

    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Clear existing questions
    await Question.deleteMany({});

    // Insert seed data
    const inserted = await Question.insertMany(questionsData);

    return NextResponse.json({
      success: true,
      count: inserted.length,
      message: `Successfully seeded ${inserted.length} questions`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
