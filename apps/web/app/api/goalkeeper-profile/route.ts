
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/s3'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'GOALKEEPER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.goalkeeperProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching goalkeeper profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'GOALKEEPER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const profileData: any = {}

    // Extract text fields
    const fields = ['age', 'bio', 'experienceLevel', 'serviceRadius', 'hourlyRateMin', 'hourlyRateMax', 'address', 'city', 'postalCode', 'latitude', 'longitude']
    fields.forEach(field => {
      const value = formData.get(field)
      if (value !== null) {
        if (field === 'age' || field === 'serviceRadius' || field === 'hourlyRateMin' || field === 'hourlyRateMax') {
          profileData[field] = parseInt(value as string)
        } else if (field === 'latitude' || field === 'longitude') {
          profileData[field] = parseFloat(value as string)
        } else {
          profileData[field] = value
        }
      }
    })

    // Handle preferred fields (array)
    const preferredFields = formData.getAll('preferredFields[]')
    if (preferredFields.length > 0) {
      profileData.preferredFields = preferredFields
    }

    // Handle file upload
    const profilePhoto = formData.get('profilePhoto') as File | null
    if (profilePhoto && profilePhoto.size > 0) {
      try {
        const buffer = Buffer.from(await profilePhoto.arrayBuffer())
        const cloudStoragePath = await uploadFile(buffer, profilePhoto.name)
        profileData.profilePhotoPath = cloudStoragePath
      } catch (uploadError) {
        console.error('Error uploading profile photo:', uploadError)
        return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
      }
    }

    const profile = await prisma.goalkeeperProfile.update({
      where: { userId: session.user.id },
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating goalkeeper profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
