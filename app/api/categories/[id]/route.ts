import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { updateCategorySchema } from '@/lib/validations/category';

/**
 * PATCH /api/categories/[id]
 * Update a category
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
    const validatedData = updateCategorySchema.parse(body);

    // Update category (ensure ownership)
    const result = await prisma.category.updateMany({
      where: {
        id,
        userId: session.user.id,
      },
      data: validatedData,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Category not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    // Fetch updated category
    const updatedCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return NextResponse.json({
      category: updatedCategory,
      message: 'Category updated successfully',
    });
  } catch (error: any) {
    console.error('Failed to update category:', error);

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
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category
 * Note: Tasks with this category will have categoryId set to null (onDelete: SetNull)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Delete category (ensure ownership)
    const result = await prisma.category.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Category not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete category:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete category', details: error.message },
      { status: 500 }
    );
  }
}
