import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { createTagSchema } from '@/lib/validations/tag';

/**
 * GET /api/tags
 * Fetch all tags for the authenticated user
 * Limited to 100 tags to prevent memory issues
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100, // Max 100 tags - reasonable limit for most users
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json({ tags });
  } catch (error: any) {
    console.error('Failed to fetch tags:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch tags', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Create a new tag
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    // Validate input
    const validatedData = createTagSchema.parse(body);

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { tag, message: 'Tag created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create tag:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle unique constraint violation (duplicate name)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tag', details: error.message },
      { status: 500 }
    );
  }
}
