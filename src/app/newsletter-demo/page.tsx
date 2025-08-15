import { NewsletterSignup } from '@/components/blog/NewsletterSignup';

export default function NewsletterDemoPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Newsletter Signup Demo</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Full Form</h2>
          <div className="max-w-md">
            <NewsletterSignup 
              title="Join Our Yoga Community"
              description="Get weekly yoga tips, meditation guides, and wellness insights delivered to your inbox."
              source="demo-full"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Compact Form</h2>
          <div className="max-w-md">
            <NewsletterSignup 
              title="Stay Updated"
              description="Weekly yoga tips and wellness insights."
              source="demo-compact"
              compact={true}
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Blog Sidebar Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Sample Blog Content</h3>
              <p className="text-gray-600 mb-4">
                This is where your blog content would go. The newsletter signup component 
                can be placed in the sidebar as shown on the right.
              </p>
              <p className="text-gray-600">
                The component is fully responsive and will adapt to different layouts 
                and screen sizes automatically.
              </p>
            </div>
            <div>
              <NewsletterSignup 
                title="Subscribe"
                description="Never miss our latest posts and yoga tips."
                source="blog-sidebar"
                compact={true}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Implementation Notes</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Newsletter signup form connects to /api/newsletter endpoint</li>
          <li>• Rate limiting implemented to prevent spam</li>
          <li>• Email validation and error handling included</li>
          <li>• Supports both new subscriptions and reactivation</li>
          <li>• JWT-based unsubscribe tokens for security</li>
          <li>• Responsive design works on all screen sizes</li>
        </ul>
      </div>
    </div>
  );
}
