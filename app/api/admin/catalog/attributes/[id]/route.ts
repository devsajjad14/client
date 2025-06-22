import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attribute = await prisma.attribute.findUnique({
      where: { id: params.id },
      include: {
        values: {
          select: {
            value: true,
          },
        },
      },
    })

    if (!attribute) {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ attribute })
  } catch (error) {
    console.error('Error fetching attribute:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attribute' },
      { status: 500 }
    )
  }
}
