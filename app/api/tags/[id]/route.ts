import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { updateTagSchema } from '@/lib/validations/tag';

/**
 * PATCH /api/tags/[id]
 * Update a tag
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validatedData = updateTagSchema.parse(body);

    // Update tag (ensure ownership)
    const result = await prisma.tag.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: validatedData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Tag not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    // Fetch updated tag
    const updatedTag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json({
      tag: updatedTag,
      message: 'Tag updated successfully',
    });
  } catch (error: any) {
    console.error('Failed to update tag:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update tag', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tags/[id]
 * Delete a tag
 * Note: TaskTag relationships will be automatically deleted (onDelete: Cascade)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Delete tag (ensure ownership)
    const result = await prisma.tag.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Tag not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Tag deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete tag:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete tag', details: error.message },
      { status: 500 }
    );
  }
}
