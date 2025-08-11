import { prisma } from '../../../lib/prisma';
import AdminClassesClient from './AdminClassesClient';

export default async function AdminClassesPage() {
  const classes = await prisma.classTemplate.findMany({
    include: {
      instructor: true,
      instances: {
        include: {
          instructor: true,
        },
      },
      exceptions: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AdminClassesClient classes={classes as any} />;
}
