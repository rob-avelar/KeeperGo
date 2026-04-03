
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create app settings (disable beta mode for development)
  await prisma.appSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      betaModeEnabled: false
    }
  })
  console.log('✓ Created app settings (beta mode disabled)')

  // Create the required test user with admin privileges
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'ORGANIZER'
    }
  })

  console.log('✓ Created test user')

  // Create admin user for backoffice access
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@keepergo.com' },
    update: {},
    create: {
      email: 'admin@keepergo.com',
      password: await bcrypt.hash('admin123', 12),
      name: 'Admin KeeperGo',
      role: 'ADMIN'
    }
  })

  console.log('✓ Created admin user (admin@keepergo.com / admin123)')

  // Create sample organizers
  const organizer1 = await prisma.user.upsert({
    where: { email: 'mike.organizer@example.com' },
    update: {},
    create: {
      email: 'mike.organizer@example.com',
      password: await bcrypt.hash('password123', 12),
      name: 'Mike Johnson',
      role: 'ORGANIZER'
    }
  })

  const organizer2 = await prisma.user.upsert({
    where: { email: 'sarah.captain@example.com' },
    update: {},
    create: {
      email: 'sarah.captain@example.com',
      password: await bcrypt.hash('password123', 12),
      name: 'Sarah Williams',
      role: 'ORGANIZER'
    }
  })

  // Create sample goalkeepers with profiles
  const goalkeeper1 = await prisma.user.upsert({
    where: { email: 'alex.goalkeeper@example.com' },
    update: {},
    create: {
      email: 'alex.goalkeeper@example.com',
      password: await bcrypt.hash('password123', 12),
      name: 'Alex van der Berg',
      role: 'GOALKEEPER'
    }
  })

  const goalkeeper2 = await prisma.user.upsert({
    where: { email: 'emma.keeper@example.com' },
    update: {},
    create: {
      email: 'emma.keeper@example.com',
      password: await bcrypt.hash('password123', 12),
      name: 'Emma de Vries',
      role: 'GOALKEEPER'
    }
  })

  const goalkeeper3 = await prisma.user.upsert({
    where: { email: 'thomas.keeper@example.com' },
    update: {},
    create: {
      email: 'thomas.keeper@example.com',
      password: await bcrypt.hash('password123', 12),
      name: 'Thomas Müller',
      role: 'GOALKEEPER'
    }
  })

  console.log('✓ Created sample users')

  // Create goalkeeper profiles
  const profile1 = await prisma.goalkeeperProfile.upsert({
    where: { userId: goalkeeper1.id },
    update: {},
    create: {
      userId: goalkeeper1.id,
      age: 28,
      bio: 'Experienced goalkeeper with 10+ years of amateur football. Available for 5-a-side, 7-a-side, and 11-a-side matches.',
      experienceLevel: 'Advanced',
      preferredFields: ['5-a-side', '7-a-side', '11-a-side', 'Indoor'],
      serviceRadius: 15,
      hourlyRateMin: 2000, // €20 (what organizer pays)
      hourlyRateMax: 3000, // €30 (what organizer pays)
      isActive: true,
      totalMatches: 45,
      averageRating: 4.7,
      totalEarnings: 843750, // €8,437.50 (75% of total bookings value)
      latitude: 52.3676,
      longitude: 4.9041,
      address: 'Centrum, Amsterdam',
      city: 'Amsterdam',
      postalCode: '1012'
    }
  })

  const profile2 = await prisma.goalkeeperProfile.upsert({
    where: { userId: goalkeeper2.id },
    update: {},
    create: {
      userId: goalkeeper2.id,
      age: 24,
      bio: 'Young and energetic goalkeeper specializing in fast-paced indoor matches. Great reflexes and communication skills.',
      experienceLevel: 'Intermediate',
      preferredFields: ['5-a-side', '7-a-side', 'Indoor'],
      serviceRadius: 12,
      hourlyRateMin: 2000, // €20 (what organizer pays)
      hourlyRateMax: 2500, // €25 (what organizer pays)
      isActive: true,
      totalMatches: 32,
      averageRating: 4.5,
      totalEarnings: 480000, // €4,800 (75% of total bookings value)
      latitude: 52.0907,
      longitude: 5.1214,
      address: 'Centrum, Utrecht',
      city: 'Utrecht',
      postalCode: '3511'
    }
  })

  const profile3 = await prisma.goalkeeperProfile.upsert({
    where: { userId: goalkeeper3.id },
    update: {},
    create: {
      userId: goalkeeper3.id,
      age: 35,
      bio: 'Veteran goalkeeper with excellent positioning and leadership. Perfect for serious 11-a-side matches.',
      experienceLevel: 'Expert',
      preferredFields: ['11-a-side', 'Outdoor'],
      serviceRadius: 20,
      hourlyRateMin: 2500, // €25 (what organizer pays)
      hourlyRateMax: 3500, // €35 (what organizer pays)
      isActive: true,
      totalMatches: 78,
      averageRating: 4.9,
      totalEarnings: 1755000, // €17,550 (75% of total bookings value)
      latitude: 51.9244,
      longitude: 4.4777,
      address: 'Centrum, Rotterdam',
      city: 'Rotterdam',
      postalCode: '3011'
    }
  })

  console.log('✓ Created goalkeeper profiles')

  // Create sample bookings
  // Create dates relative to now for testing
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(14, 0, 0, 0)
  
  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  twoDaysAgo.setHours(10, 0, 0, 0)
  
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)
  nextWeek.setHours(16, 0, 0, 0)

  // Booking 1: Match ended yesterday - needs goalkeeper confirmation
  const booking1 = await prisma.booking.create({
    data: {
      organizerId: organizer1.id,
      goalkeeperId: goalkeeper1.id,
      goalkeeperProfileId: profile1.id,
      date: yesterday,
      duration: 2,
      location: 'Vondelpark Football Field, Amsterdam',
      latitude: 52.3598,
      longitude: 4.8776,
      fieldType: '7-a-side',
      pricePerHour: 2000, // €20/hour
      totalAmount: 4000, // €40 total
      status: 'CONFIRMED',
      confirmationDeadline: new Date(yesterday.getTime() + 48 * 60 * 60 * 1000) // 48h after match
    }
  })

  // Booking 2: Match ended 2 days ago - already confirmed by goalkeeper, needs organizer confirmation
  const booking2 = await prisma.booking.create({
    data: {
      organizerId: organizer2.id,
      goalkeeperId: goalkeeper2.id,
      goalkeeperProfileId: profile2.id,
      date: twoDaysAgo,
      duration: 1,
      location: 'Sports Center Utrecht',
      latitude: 52.0907,
      longitude: 5.1214,
      fieldType: '5-a-side',
      pricePerHour: 2500, // €25/hour
      totalAmount: 2500, // €25 total
      status: 'CONFIRMED',
      goalkeeperConfirmedAt: new Date(twoDaysAgo.getTime() + 2 * 60 * 60 * 1000), // Confirmed 2h after match
      confirmationDeadline: new Date(twoDaysAgo.getTime() + 48 * 60 * 60 * 1000) // 48h after match
    }
  })

  // Booking 3: Future match
  const booking3 = await prisma.booking.create({
    data: {
      organizerId: testUser.id,
      goalkeeperId: goalkeeper3.id,
      goalkeeperProfileId: profile3.id,
      date: nextWeek,
      duration: 2,
      location: 'Rotterdam Football Club',
      latitude: 51.9244,
      longitude: 4.4777,
      fieldType: '11-a-side',
      pricePerHour: 2500, // €25/hour
      totalAmount: 5000, // €50 total
      status: 'CONFIRMED',
      confirmationDeadline: new Date(nextWeek.getTime() + 48 * 60 * 60 * 1000) // 48h after match
    }
  })

  // Booking 4: Completed match (for ratings/payments examples)
  const oneWeekAgo = new Date(now)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  oneWeekAgo.setHours(18, 0, 0, 0)
  
  const booking4 = await prisma.booking.create({
    data: {
      organizerId: organizer2.id,
      goalkeeperId: goalkeeper3.id,
      goalkeeperProfileId: profile3.id,
      date: oneWeekAgo,
      duration: 1,
      location: 'Ajax Training Center',
      latitude: 52.3135,
      longitude: 4.9412,
      fieldType: '5-a-side',
      pricePerHour: 2000, // €20/hour
      totalAmount: 2000, // €20 total
      status: 'COMPLETED',
      isCompleted: true,
      goalkeeperConfirmedAt: new Date(oneWeekAgo.getTime() + 3 * 60 * 60 * 1000),
      confirmedAt: new Date(oneWeekAgo.getTime() + 4 * 60 * 60 * 1000),
      confirmationDeadline: new Date(oneWeekAgo.getTime() + 48 * 60 * 60 * 1000)
    }
  })

  console.log('✓ Created sample bookings')

  // Create sample ratings for completed bookings
  const rating1 = await prisma.rating.create({
    data: {
      bookingId: booking4.id,
      raterId: organizer2.id,
      ratedUserId: goalkeeper3.id,
      punctuality: 5,
      attitude: 4,
      technicalSkill: 8,
      overallRating: 4.5,
      comment: 'Great goalkeeper with excellent reflexes. Very professional and punctual!'
    }
  })

  console.log('✓ Created sample ratings')

  // Create sample payments
  const payment1 = await prisma.payment.create({
    data: {
      userId: organizer2.id,
      bookingId: booking4.id,
      amount: 2000,
      platformFee: 500, // 25% platform fee (€5)
      goalkeeperEarning: 1500, // 75% to goalkeeper (€15)
      status: 'COMPLETED',
      paymentMethod: 'card'
    }
  })

  console.log('✓ Created sample payments')

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: goalkeeper1.id,
        bookingId: booking1.id,
        title: 'New Booking Request',
        message: 'Mike Johnson has requested you for a match on Dec 20th',
        type: 'BOOKING_REQUEST'
      },
      {
        userId: goalkeeper2.id,
        bookingId: booking2.id,
        title: 'Match Completed',
        message: 'Your match with Sarah Williams has been completed. Please rate your experience.',
        type: 'RATING_REQUEST',
        isRead: true
      },
      {
        userId: organizer1.id,
        bookingId: booking1.id,
        title: 'Booking Confirmed',
        message: 'Alex van der Berg has accepted your booking request!',
        type: 'BOOKING_ACCEPTED'
      }
    ]
  })

  console.log('✓ Created sample notifications')

  // Update goalkeeper stats based on bookings
  await prisma.goalkeeperProfile.update({
    where: { id: profile2.id },
    data: {
      totalMatches: { increment: 1 }
    }
  })

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Test Accounts:')
  console.log('Organizer: john@doe.com / johndoe123')
  console.log('Organizer: mike.organizer@example.com / password123')
  console.log('Goalkeeper: alex.goalkeeper@example.com / password123')
  console.log('Goalkeeper: emma.keeper@example.com / password123')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
