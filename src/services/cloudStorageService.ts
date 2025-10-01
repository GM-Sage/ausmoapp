// Cloud Storage Service for Custom Symbols
// Uses Cloudinary REST API for React Native compatibility

// Import FormData from React Native polyfills
import { FormData } from 'react-native';

// Cloudinary configuration from environment variables
const cloudinaryConfig = {
  cloud_name:
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
};

class CloudStorageService {
  private static instance: CloudStorageService;
  private isConfigured: boolean = false;

  private constructor() {
    try {
      this.isConfigured = !!(
        cloudinaryConfig.cloud_name &&
        cloudinaryConfig.cloud_name !== 'your-cloud-name' &&
        cloudinaryConfig.api_key &&
        cloudinaryConfig.api_key !== 'your-api-key' &&
        cloudinaryConfig.api_secret &&
        cloudinaryConfig.api_secret !== 'your-api-secret'
      );
      if (this.isConfigured) {
        console.log('Cloudinary configured successfully');
      } else {
        console.warn('Cloudinary not configured, using local storage only');
      }
    } catch (error) {
      console.warn(
        'Cloudinary configuration failed, using local storage only:',
        error
      );
      this.isConfigured = false;
    }
  }

  public static getInstance(): CloudStorageService {
    if (!CloudStorageService.instance) {
      CloudStorageService.instance = new CloudStorageService();
    }
    return CloudStorageService.instance;
  }

  // Upload image to Cloudinary using REST API
  public async uploadImage(
    imageUri: string,
    fileName: string
  ): Promise<string | null> {
    if (!this.isConfigured) {
      console.warn('Cloudinary not configured, using local URI');
      return imageUri; // Fallback to local URI
    }

    try {
      // Convert local URI to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);

      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', `data:image/jpeg;base64,${base64}`);
      formData.append('public_id', `ausmo-custom-symbols/${fileName}`);
      formData.append('folder', 'ausmo-custom-symbols');
      formData.append('resource_type', 'image');
      formData.append(
        'transformation',
        'w_300,h_300,c_fill,g_center,q_auto,f_auto'
      );

      // Upload to Cloudinary using REST API
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`;

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();
      console.log(
        'Image uploaded successfully to Cloudinary:',
        result.secure_url
      );
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return imageUri; // Fallback to local URI
    }
  }

  // Delete image from Cloudinary using REST API
  public async deleteImage(imageUrl: string): Promise<boolean> {
    if (!this.isConfigured || !imageUrl.includes('cloudinary')) {
      return true; // Not a Cloudinary image or not configured
    }

    try {
      // Extract public_id from URL
      const publicId = this.extractPublicIdFromUrl(imageUrl);
      if (!publicId) {
        console.warn('Could not extract public_id from URL');
        return false;
      }

      // Create signature for authenticated request
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = this.generateSignature(publicId, timestamp);

      // Delete from Cloudinary using REST API
      const deleteUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/destroy`;

      const deleteResponse = await fetch(deleteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          timestamp: timestamp,
          signature: signature,
          api_key: cloudinaryConfig.api_key,
        }),
      });

      if (!deleteResponse.ok) {
        throw new Error(`Delete failed: ${deleteResponse.statusText}`);
      }

      console.log('Image deleted successfully from Cloudinary');
      return true;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }

  // Check if cloud storage is available
  public isCloudStorageAvailable(): boolean {
    return this.isConfigured;
  }

  // Helper method to convert blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Helper method to extract public_id from Cloudinary URL
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const match = url.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return null;
    }
  }

  // Generate signature for authenticated Cloudinary requests
  private generateSignature(publicId: string, timestamp: number): string {
    const CryptoJS = require('react-native-crypto-js');
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${cloudinaryConfig.api_secret}`;
    return CryptoJS.SHA1(stringToSign).toString();
  }
}

export default CloudStorageService;
