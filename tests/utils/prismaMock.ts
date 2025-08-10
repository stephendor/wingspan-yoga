// Shared Prisma mock utility for tests
// Provides a reusable mock prisma object mirroring the subset of methods
// exercised by our API route tests. Each method is a jest.Mock so tests can
// tailor resolved values and assertions per scenario.

export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  session: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
}

// Convenience reset between tests
export const resetPrismaMock = () => {
  prismaMock.user.findUnique.mockReset()
  prismaMock.user.create.mockReset()
  prismaMock.session.create.mockReset()
  prismaMock.session.deleteMany.mockReset()
}

export type PrismaMock = typeof prismaMock
