// Placeholder email sender for booking confirmations.
// Replace with actual provider integration (Resend, SendGrid, SES, etc.).
export interface BookingConfirmationPayload {
  user: { id: string; name: string | null; email: string | null }
  booking: {
    id: string
    classId: string
    classTitle: string
    startTime: Date
    location: string | null
    instructorName: string | null
  }
}

export async function sendBookingConfirmationEmail(payload: BookingConfirmationPayload): Promise<void> {
  if (!payload.user.email) return
  // Stub implementation – just log (tests will mock this function)
  console.info('[email] booking_confirmation', {
    to: payload.user.email,
    bookingId: payload.booking.id,
    class: payload.booking.classTitle,
    start: payload.booking.startTime.toISOString(),
  })
}
