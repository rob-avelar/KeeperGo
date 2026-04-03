import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Check if beta mode is enabled (public endpoint)
export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'settings' }
    })

    return NextResponse.json({ 
      betaModeEnabled: settings?.betaModeEnabled ?? true 
    })
  } catch (error) {
    console.error('Error checking beta status:', error)
    // Default to beta mode if error
    return NextResponse.json({ betaModeEnabled: true })
  }
}
