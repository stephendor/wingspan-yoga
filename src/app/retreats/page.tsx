import { Metadata } from 'next'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { retreatImages } from '@/lib/images'

export const metadata: Metadata = {
  title: 'Yoga Retreats | Wingspan Yoga',
  description: 'Join us for transformative yoga retreats in beautiful locations around the world.',
}

export default async function RetreatsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-softyellow-50 via-white to-softblue-50">
      <div className="bg-gradient-to-br from-softyellow-100 via-white to-softblue-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-playfair">
              Yoga Retreats & Workshops
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-500 font-lato">
              A chance to spend time in wonderful locations, with space to focus on yoga & meditation practice and to simply be.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Retreat Descriptions */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Snowdonia Retreat */}
          <div className="bg-white p-8 rounded-natural shadow-soft">
            <div className="aspect-video rounded-natural mb-6 overflow-hidden">
              <OptimizedImage
                config={retreatImages.snowdonia}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-playfair font-semibold text-gray-800 mb-4">
              Snowdonia Retreat
            </h3>
            <p className="text-gray-700 font-lato leading-relaxed">
              A chance to spend a weekend in this wonderful location, with time and space to focus on yoga & meditation practice and to simply be. No prior experience of meditation is needed. We will be taking inspiration from the landscape around us - the stillness and majesty of the mountains, the presence of the lake, the green spring flora and the elements of the weather, whatever that may be!
            </p>
            <p className="text-gray-700 font-lato leading-relaxed mt-4">
              We will let the inspiration from nature support and inform our practice on the mat, with the aim of rejuvenation for body and mind from this peaceful setting, as well as our sessions together. There will be free time for walking, or swimming in the lake, or simply sitting in the garden enjoying the view. The location would also make an excellent jumping off point for a longer stay over the Easter holidays in Snowdonia. The area has so much to offer and the beautiful North Wales coast, including the Llyn peninsula is also close by.
            </p>
          </div>

          {/* Worcestershire Retreat */}
          <div className="bg-white p-8 rounded-natural shadow-soft">
            <div className="aspect-video rounded-natural mb-6 overflow-hidden">
              <OptimizedImage
                config={retreatImages.worcestershire}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-playfair font-semibold text-gray-800 mb-4">
              Worcestershire Retreat
            </h3>
            <p className="text-gray-700 font-lato leading-relaxed">
              A relaxed weekend of yoga practice, good food and good company in beautiful surroundings in Worcestershire. A chance to drink in some seasonal delights in the English countryside. The Fold is a lovely venue - a community farm, with its own cafe and artists&apos; studios, as well as the converted barn where our yoga sessions will take place.
            </p>
            <p className="text-gray-700 font-lato leading-relaxed mt-4">
              There is a choice of local accommodation from onsite camping to a very comfortable hotel across the road. Evening catering is provided by our very own Manasi Nandi, at a private location nearby. After a lovely visit in May this year we are very lucky to be invited to back to this lovely corner of the country in August 2025!
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}