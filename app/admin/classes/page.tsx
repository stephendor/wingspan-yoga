import { prisma } from '../../../src/lib/prisma';
import AdminClassesClient from './AdminClassesClient';

export default async function AdminClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      instructor: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  return <AdminClassesClient classes={classes} />;
}
