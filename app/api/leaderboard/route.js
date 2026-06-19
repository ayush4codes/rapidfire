import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Result from '@/lib/models/Result';
import User from '@/lib/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const results = await Result.find({})
      .populate('userId', 'fullName githubUsername')
      .sort({ score: -1, completedAt: 1 })
      .lean();

    const leaderboard = results.map((r, index) => ({
      rank: index + 1,
      fullName: r.userId?.fullName || 'Unknown',
      githubUsername: r.userId?.githubUsername || 'unknown',
      score: r.score,
      totalQuestions: r.totalQuestions,
      percentage: Math.round((r.score / r.totalQuestions) * 100),
      completedAt: r.completedAt,
      avgTime: Math.round(
        r.answers.reduce((sum, a) => sum + a.timeTaken, 0) / r.answers.length
      ),
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
