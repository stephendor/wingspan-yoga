import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

interface ArchivePageProps {
  params: Promise<{
    year: string;
    month?: string;
  }>;
}

export async function generateMetadata({ params }: ArchivePageProps): Promise<Metadata> {
  const { year, month } = await params;
  
  const yearNum = parseInt(year);
  const monthNum = month ? parseInt(month) : null;
  
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
    return {
      title: 'Invalid Archive - Wingspan Yoga',
    };
  }
  
  if (monthNum && (isNaN(monthNum) || monthNum < 1 || monthNum > 12)) {
    return {
      title: 'Invalid Archive - Wingspan Yoga',
    };
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const title = monthNum 
    ? `${monthNames[monthNum - 1]} ${yearNum} Archive - Wingspan Yoga`
    : `${yearNum} Archive - Wingspan Yoga`;

  const description = monthNum
    ? `Blog posts from ${monthNames[monthNum - 1]} ${yearNum}`
    : `Blog posts from ${yearNum}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function ArchivePage({ params }: ArchivePageProps) {
  const { year, month } = await params;
  
  const yearNum = parseInt(year);
  const monthNum = month ? parseInt(month) : null;
  
  // Validate year
  if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear() + 1) {
    notFound();
  }
  
  // Validate month if provided
  if (monthNum && (isNaN(monthNum) || monthNum < 1 || monthNum > 12)) {
    notFound();
  }

  // Redirect to blog page with year/month search parameters
  const searchParams = new URLSearchParams({
    year: year,
  });
  
  if (month) {
    searchParams.append('month', month);
  }

  redirect(`/blog?${searchParams.toString()}`);
}
