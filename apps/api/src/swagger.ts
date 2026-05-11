export const openApiDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Hotel Booking API',
    version: '1.0.0',
  },
  paths: {
    '/health': { get: { summary: 'Liveness (lightweight)' } },
    '/health/live': { get: { summary: 'Liveness probe' } },
    '/health/ready': { get: { summary: 'Readiness (includes database check)' } },

    // Auth
    '/api/v1/auth/register': { post: { summary: 'Register' } },
    '/api/v1/auth/login': { post: { summary: 'Login' } },
    '/api/v1/auth/google': { post: { summary: 'Sign in or register with Google ID token' } },
    '/api/v1/auth/logout': { post: { summary: 'Logout' } },
    '/api/v1/auth/refresh': { post: { summary: 'Refresh access token' } },
    '/api/v1/auth/verify-email': { get: { summary: 'Verify email' } },
    '/api/v1/auth/forgot-password': { post: { summary: 'Forgot password' } },
    '/api/v1/auth/reset-password': { post: { summary: 'Reset password' } },
    '/api/v1/auth/me': { get: { summary: 'Get current user', security: [{ bearerAuth: [] }] } },

    '/api/v1/contact': { post: { summary: 'Public contact form', security: [] } },

    // Hotels
    '/api/v1/hotels': { get: { summary: 'List hotels', security: [] } },
    '/api/v1/hotels/destinations': {
      get: { summary: 'Popular destinations (city/country aggregates)', security: [] },
    },
    '/api/v1/hotels/{slug}': { get: { summary: 'Hotel detail' } },
    '/api/v1/hotels/{slug}/rooms/{roomId}': { get: { summary: 'Room detail for a hotel' } },
    '/api/v1/hotels/{slug}/calendar': { get: { summary: 'Room-night availability calendar' } },
    '/api/v1/hotels/{slug}/availability': { get: { summary: 'Availability for dates' } },

    // Bookings
    '/api/v1/bookings': { post: { summary: 'Create booking', security: [{ bearerAuth: [] }] } },
    '/api/v1/bookings/me': { get: { summary: 'My bookings', security: [{ bearerAuth: [] }] } },
    '/api/v1/bookings/{id}/pay': {
      post: { summary: 'Create Stripe payment intent', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/bookings/{id}/payment-intent': {
      post: { summary: 'Alias: payment intent', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/bookings/checkout-session/{sessionId}': {
      get: {
        summary: 'Resolve booking from Stripe Checkout session',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/v1/bookings/{id}': {
      patch: { summary: 'Cancel booking', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/bookings/{id}/cancel': {
      patch: { summary: 'Alias: cancel booking', security: [{ bearerAuth: [] }] },
    },

    // Wishlist
    '/api/v1/wishlist': { get: { summary: 'List wishlist', security: [{ bearerAuth: [] }] } },
    '/api/v1/wishlist/{hotelId}': {
      post: { summary: 'Toggle wishlist for hotel', security: [{ bearerAuth: [] }] },
    },

    // Notifications
    '/api/v1/notifications': {
      get: { summary: 'List notifications', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/notifications/push/register': {
      post: { summary: 'Register FCM device token', security: [{ bearerAuth: [] }] },
      delete: { summary: 'Unregister FCM device token', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/notifications/mark-all-read': {
      post: { summary: 'Mark all notifications read', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/notifications/{id}/read': {
      patch: { summary: 'Mark notification as read', security: [{ bearerAuth: [] }] },
    },

    // Reviews
    '/api/v1/reviews': { post: { summary: 'Create review', security: [{ bearerAuth: [] }] } },
    '/api/v1/reviews/hotel/{hotelId}': { get: { summary: 'Approved reviews for a hotel' } },

    // Stripe webhook
    '/api/v1/webhooks/stripe': { post: { summary: 'Stripe webhook (raw body)', security: [] } },

    // Admin
    '/api/v1/admin/dashboard': {
      get: { summary: 'Admin dashboard KPIs', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/dashboard/kpis': {
      get: { summary: 'Admin dashboard KPIs (canonical)', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/hotels': {
      get: { summary: 'List hotels for managers', security: [{ bearerAuth: [] }] },
      post: { summary: 'Create hotel', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/hotels/{id}': {
      patch: { summary: 'Update hotel', security: [{ bearerAuth: [] }] },
      delete: { summary: 'Delete hotel', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/rooms': {
      get: { summary: 'List rooms', security: [{ bearerAuth: [] }] },
      post: { summary: 'Create room', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/rooms/{id}': {
      patch: { summary: 'Update room', security: [{ bearerAuth: [] }] },
      delete: { summary: 'Delete room', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/bookings': { get: { summary: 'List bookings', security: [{ bearerAuth: [] }] } },
    '/api/v1/admin/bookings/{id}': {
      patch: { summary: 'Update booking status', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/bookings/{id}/refund': {
      post: { summary: 'Refund confirmed booking in Stripe', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/uploads/image': {
      post: { summary: 'Upload image to Cloudinary', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/reviews': {
      get: { summary: 'Moderation queue (pending reviews)', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/reviews/{id}': {
      patch: { summary: 'Moderate review (approve/reject)', security: [{ bearerAuth: [] }] },
    },
    '/api/v1/admin/reports/export': {
      get: { summary: 'Export reports (CSV)', security: [{ bearerAuth: [] }] },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};
