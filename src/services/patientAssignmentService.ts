// Patient Assignment Service - HIPAA Compliant
// Handles secure patient-therapist connections

import { DatabaseService } from './databaseService';
import { SupabaseDatabaseService } from './supabaseDatabaseService';

export interface PatientAssignmentRequest {
  id: string;
  parentId: string;
  therapistId: string;
  childId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestMessage?: string;
  therapistResponse?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  licenseNumber: string;
  specialties: string[];
  credentials: string[];
  practiceName?: string;
  practiceAddress?: string;
  phoneNumber?: string;
  email: string;
  isVerified: boolean;
  isAcceptingPatients: boolean;
  maxPatients: number;
  currentPatientCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentProfile {
  id: string;
  userId: string;
  children: string[]; // Array of child user IDs
  emergencyContact?: string;
  preferredCommunicationMethod: 'email' | 'phone' | 'app';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildProfile {
  id: string;
  userId: string;
  parentId: string;
  dateOfBirth: Date;
  diagnosis?: string[];
  currentTherapists: string[]; // Array of therapist user IDs
  medicalNotes?: string;
  emergencyContact?: string;
  createdAt: Date;
  updatedAt: Date;
}

class PatientAssignmentService {
  private static instance: PatientAssignmentService;
  private dbService: DatabaseService;
  private supabaseService: SupabaseDatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.supabaseService = SupabaseDatabaseService.getInstance();
  }

  public static getInstance(): PatientAssignmentService {
    if (!PatientAssignmentService.instance) {
      PatientAssignmentService.instance = new PatientAssignmentService();
    }
    return PatientAssignmentService.instance;
  }

  // Search for therapists (public information only)
  async searchTherapists(
    query: string,
    specialty?: string
  ): Promise<TherapistProfile[]> {
    try {
      const therapists = await this.supabaseService.searchTherapists(
        query,
        specialty
      );

      // Return only public, non-sensitive information
      return therapists.map(therapist => ({
        id: therapist.id,
        userId: therapist.userId,
        licenseNumber: therapist.licenseNumber,
        specialties: therapist.specialties,
        credentials: therapist.credentials,
        practiceName: therapist.practiceName,
        practiceAddress: therapist.practiceAddress,
        phoneNumber: therapist.phoneNumber,
        email: therapist.email,
        isVerified: therapist.isVerified,
        isAcceptingPatients: therapist.isAcceptingPatients,
        maxPatients: therapist.maxPatients,
        currentPatientCount: therapist.currentPatientCount,
        createdAt: therapist.createdAt,
        updatedAt: therapist.updatedAt,
      }));
    } catch (error) {
      console.error('Error searching therapists:', error);
      throw new Error('Failed to search therapists');
    }
  }

  // Create a patient assignment request
  async createAssignmentRequest(
    parentId: string,
    therapistId: string,
    childId: string,
    requestMessage?: string
  ): Promise<PatientAssignmentRequest> {
    try {
      // Validate that parent has permission for this child
      const parentProfile =
        await this.supabaseService.getParentProfile(parentId);
      if (!parentProfile.children.includes(childId)) {
        throw new Error('Parent does not have permission for this child');
      }

      // Check if therapist is accepting patients
      const therapistProfile =
        await this.supabaseService.getTherapistProfile(therapistId);
      if (!therapistProfile.isAcceptingPatients) {
        throw new Error('Therapist is not currently accepting new patients');
      }

      if (
        therapistProfile.currentPatientCount >= therapistProfile.maxPatients
      ) {
        throw new Error('Therapist has reached maximum patient capacity');
      }

      // Check for existing pending request
      const existingRequest =
        await this.supabaseService.getPendingAssignmentRequest(
          parentId,
          therapistId,
          childId
        );
      if (existingRequest) {
        throw new Error('A pending request already exists for this therapist');
      }

      const request: PatientAssignmentRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        parentId,
        therapistId,
        childId,
        status: 'pending',
        requestMessage,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      await this.supabaseService.createAssignmentRequest(request);
      return request;
    } catch (error) {
      console.error('Error creating assignment request:', error);
      throw error;
    }
  }

  // Get assignment requests for a therapist
  async getTherapistRequests(
    therapistId: string
  ): Promise<PatientAssignmentRequest[]> {
    try {
      return await this.supabaseService.getTherapistAssignmentRequests(
        therapistId
      );
    } catch (error) {
      console.error('Error getting therapist requests:', error);
      throw new Error('Failed to get assignment requests');
    }
  }

  // Approve or reject an assignment request
  async respondToAssignmentRequest(
    requestId: string,
    therapistId: string,
    approved: boolean,
    responseMessage?: string
  ): Promise<void> {
    try {
      const request =
        await this.supabaseService.getAssignmentRequest(requestId);

      if (request.therapistId !== therapistId) {
        throw new Error('Unauthorized to respond to this request');
      }

      if (request.status !== 'pending') {
        throw new Error('Request has already been processed');
      }

      if (request.expiresAt < new Date()) {
        throw new Error('Request has expired');
      }

      const updatedRequest: PatientAssignmentRequest = {
        ...request,
        status: approved ? 'approved' : 'rejected',
        therapistResponse: responseMessage,
        updatedAt: new Date(),
      };

      await this.supabaseService.updateAssignmentRequest(updatedRequest);

      if (approved) {
        // Add child to therapist's patient list
        await this.supabaseService.addPatientToTherapist(
          request.therapistId,
          request.childId
        );

        // Add therapist to child's therapist list
        await this.supabaseService.addTherapistToChild(
          request.childId,
          request.therapistId
        );
      }
    } catch (error) {
      console.error('Error responding to assignment request:', error);
      throw error;
    }
  }

  // Get assignment requests for a parent
  async getParentRequests(
    parentId: string
  ): Promise<PatientAssignmentRequest[]> {
    try {
      return await this.supabaseService.getParentAssignmentRequests(parentId);
    } catch (error) {
      console.error('Error getting parent requests:', error);
      throw new Error('Failed to get assignment requests');
    }
  }

  // Remove a patient-therapist relationship
  async removePatientTherapistRelationship(
    therapistId: string,
    childId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Remove from therapist's patient list
      await this.supabaseService.removePatientFromTherapist(
        therapistId,
        childId
      );

      // Remove from child's therapist list
      await this.supabaseService.removeTherapistFromChild(childId, therapistId);

      // Log the removal for audit purposes
      await this.supabaseService.logPatientTherapistRemoval(
        therapistId,
        childId,
        reason
      );
    } catch (error) {
      console.error('Error removing patient-therapist relationship:', error);
      throw error;
    }
  }

  // Get child's current therapists
  async getChildTherapists(childId: string): Promise<TherapistProfile[]> {
    try {
      const childProfile = await this.supabaseService.getChildProfile(childId);
      const therapistIds = childProfile.currentTherapists;

      const therapists = await Promise.all(
        therapistIds.map(id => this.supabaseService.getTherapistProfile(id))
      );

      return therapists;
    } catch (error) {
      console.error('Error getting child therapists:', error);
      throw new Error('Failed to get child therapists');
    }
  }

  // Get therapist's current patients
  async getTherapistPatients(therapistId: string): Promise<ChildProfile[]> {
    try {
      const therapistProfile =
        await this.supabaseService.getTherapistProfile(therapistId);
      const patientIds = therapistProfile.currentPatients || [];

      const patients = await Promise.all(
        patientIds.map(id => this.supabaseService.getChildProfile(id))
      );

      return patients;
    } catch (error) {
      console.error('Error getting therapist patients:', error);
      throw new Error('Failed to get therapist patients');
    }
  }

  // Audit log for compliance
  async getAuditLog(
    entityType: 'patient' | 'therapist' | 'assignment',
    entityId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      return await this.supabaseService.getAuditLog(
        entityType,
        entityId,
        startDate,
        endDate
      );
    } catch (error) {
      console.error('Error getting audit log:', error);
      throw new Error('Failed to get audit log');
    }
  }
}

export default PatientAssignmentService;
