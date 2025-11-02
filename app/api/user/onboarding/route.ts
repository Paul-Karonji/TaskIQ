// API Route: User onboarding status management
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for onboarding updates
const onboardingUpdateSchema = z.object({
  hasCompletedOnboarding: z.boolean().optional(),
  onboardingSkipped: z.boolean().optional(),
});

// GET - Fetch onboarding status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: true,
        onboardingSkipped: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('[Onboarding GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}

// PATCH - Update onboarding status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = onboardingUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { hasCompletedOnboarding, onboardingSkipped } = validationResult.data;

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (hasCompletedOnboarding !== undefined) {
      updateData.hasCompletedOnboarding = hasCompletedOnboarding;
      if (hasCompletedOnboarding) {
        updateData.onboardingCompletedAt = new Date();
      }
    }

    if (onboardingSkipped !== undefined) {
      updateData.onboardingSkipped = onboardingSkipped;
      if (onboardingSkipped) {
        updateData.hasCompletedOnboarding = true; // Also mark as completed if skipped
        updateData.onboardingCompletedAt = new Date();
      }
    }

    // Update user onboarding status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        hasCompletedOnboarding: true,
        onboardingCompletedAt: true,
        onboardingSkipped: true,
      },
    });

    console.log(
      `[Onboarding] User ${session.user.id} updated:`,
      hasCompletedOnboarding ? 'completed' : onboardingSkipped ? 'skipped' : 'updated'
    );

    return NextResponse.json({
      success: true,
      onboarding: updatedUser,
    });
  } catch (error: any) {
    console.error('[Onboarding PATCH] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
}
