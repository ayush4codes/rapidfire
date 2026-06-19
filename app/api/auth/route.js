import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    const { fullName, githubUsername } = await request.json();

    if (!fullName || !githubUsername) {
      return NextResponse.json(
        { error: 'Full name and GitHub username are required' },
        { status: 400 }
      );
    }

    const cleanUsername = githubUsername.trim().toLowerCase();
    const cleanName = fullName.trim();

    // Check if user already exists
    let user = await User.findOne({ githubUsername: cleanUsername });

    if (user) {
      // User exists — check if they've already attempted
      if (user.hasAttempted) {
        return NextResponse.json(
          { error: 'You have already attempted the quiz. Only one attempt is allowed.' },
          { status: 403 }
        );
      }
      // Update name if changed
      user.fullName = cleanName;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        fullName: cleanName,
        githubUsername: cleanUsername,
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        githubUsername: user.githubUsername,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
