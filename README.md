# Product Image Updater - Frontend App

A React-based Shopify app for updating product images by collection. This app allows users to:

- Search for collections by name
- View products with image thumbnails
- Select products (all or individual)
- Download CSV templates with current image information
- Upload updated CSV files with new image URLs
- Process image updates with rollback capability

## Features

### 🖼️ Image Management
- **Minimal Product List**: Shows product name, number of images, and select button
- **Expandable Details**: Click "Show details" to see all product images and storefront link
- **Image Thumbnails**: Visual preview of all product images
- **Storefront Integration**: Direct link to view products in the store

### 📊 CSV Workflow
- **Template Generation**: Creates CSV files with current image data
- **Image ID Tracking**: Includes current image IDs for variant relationships
- **Batch Processing**: Handle multiple products at once
- **Validation**: Ensures proper CSV format and data integrity

### 🔄 Operations Management
- **Operation History**: Track all image update operations
- **Rollback Capability**: Revert changes if needed
- **Status Tracking**: Monitor operation progress
- **Error Handling**: Comprehensive error reporting

## Project Structure

```
src/
├── components/
│   ├── collections/
│   │   └── CollectionSearch.tsx      # Collection search functionality
│   ├── common/
│   │   └── AppBridgeProvider.tsx     # Shopify App Bridge integration
│   ├── image-update/
│   │   └── ImageUpdatePanel.tsx      # CSV export/import and operations
│   ├── layout/
│   │   └── AppLayout.tsx             # Main app layout
│   └── products/
│       └── ProductGrid.tsx           # Product display with expandable details
├── constants/
│   └── app.ts                        # App configuration and constants
├── hooks/
│   └── useShopifyAuth.ts             # Shopify authentication hook
├── pages/
│   └── HomePage.tsx                  # Main app page
├── services/
│   └── serverApiService.ts           # API service for backend communication
├── types/
│   └── shopify.ts                    # TypeScript type definitions
├── main.tsx                          # App entry point
└── vite-env.d.ts                     # Vite environment types
```

## Getting Started

### Prerequisites
- Node.js v22 or higher
- npm or yarn
- Shopify Partner account
- Shopify development store

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables (optional for development):**
   Create a `.env` file in the root directory for local development:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_SHOPIFY_API_KEY=your_shopify_api_key
   ```
   
   **Note:** For production deployment, these values are typically set in GitHub Actions secrets or your deployment platform.

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Usage

### Basic Workflow

1. **Search Collections**: Use the search bar to find collections by name
2. **Select Products**: Choose products using "Select All" or individual selection
3. **Create Operation**: Generate a CSV template with current image data
4. **Download CSV**: Get the template file with product and image information
5. **Update URLs**: Edit the "New Image URL" column in the CSV
6. **Upload CSV**: Upload the updated file back to the app
7. **Process Updates**: Apply the image changes to your products

### CSV Format

The CSV file contains these columns:
- `product_id`: Shopify product ID
- `product_handle`: Product URL handle
- `current_image_id`: Current image ID (for variant relationships)
- `collection_name`: Collection name
- `new_image_url`: New image URL to replace current image

### Image-Variant Relationships

The app handles the complex relationship between product images and variants:
- Each variant can reference a specific image by ID
- When updating images, the app maintains these relationships
- The CSV includes current image IDs to ensure proper mapping

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Shopify Polaris** - UI components
- **Shopify App Bridge** - Shopify integration

### Architecture

The app follows a clean architecture pattern:
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for business logic
- **Services**: API communication layer
- **Types**: TypeScript type definitions
- **Constants**: App configuration

## API Integration

The app communicates with a backend API for:
- Collection and product data
- Image update operations
- CSV file processing
- Operation history and rollback

See `src/services/serverApiService.ts` for API endpoints and methods.

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Test thoroughly before submitting changes
4. Update documentation as needed

## License

This project is part of the Shopify Apps suite and follows the same licensing terms.
