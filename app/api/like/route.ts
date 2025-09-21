import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Like from '../../../models/Like'

export async function POST(request: NextRequest) {
  try {
    const { imageId, postId } = await request.json()

    const id = postId || imageId

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID or Image ID is required' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await connectDB()

    // Find existing like record
    let likeRecord = await Like.findOne({ imageId: id })

    if (likeRecord) {
      // Update existing record
      likeRecord.count += 1
      likeRecord.lastLiked = new Date()
      await likeRecord.save()
    } else {
      // Create new record
      likeRecord = new Like({
        imageId: id,
        count: 1,
        lastLiked: new Date()
      })
      await likeRecord.save()
    }

    // Log the like action (this is the backend message capture)
    console.log(`Like recorded for post: ${id} at ${new Date().toISOString()}`)
    console.log(`Total likes for ${id}: ${likeRecord.count}`)

    return NextResponse.json({
      success: true,
      postId: id,
      likes: likeRecord.count,
      message: `Like recorded for post ${id}`
    })

  } catch (error) {
    console.error('Error processing like:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('imageId')
    const postId = searchParams.get('postId')

    // Connect to MongoDB
    await connectDB()

    const id = postId || imageId

    if (id) {
      // Get likes for specific post/image
      const likeRecord = await Like.findOne({ imageId: id })
      return NextResponse.json({
        postId: id,
        likes: likeRecord ? likeRecord.count : 0
      })
    } else {
      // Get all likes
      const allLikes = await Like.find({})
      return NextResponse.json({
        likes: allLikes
      })
    }

  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
