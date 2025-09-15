import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Create Supabase client
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Database types
export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string;
          name: string;
          type: string;
          format: string;
          size: string;
          url: string;
          project_id: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          format: string;
          size: string;
          url: string;
          project_id: string;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          format?: string;
          size?: string;
          url?: string;
          project_id?: string;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      colors: {
        Row: {
          id: string;
          name: string;
          hex: string;
          usage: string;
          pantone?: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          hex: string;
          usage: string;
          pantone?: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          hex?: string;
          usage?: string;
          pantone?: string;
          project_id?: string;
          created_at?: string;
        };
      };
      fonts: {
        Row: {
          id: string;
          name: string;
          weight: string;
          usage: string;
          family: string;
          url?: string;
          file_name?: string;
          file_size?: string;
          uploaded_by?: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          weight: string;
          usage: string;
          family: string;
          url?: string;
          file_name?: string;
          file_size?: string;
          uploaded_by?: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          weight?: string;
          usage?: string;
          family?: string;
          url?: string;
          file_name?: string;
          file_size?: string;
          uploaded_by?: string;
          project_id?: string;
          created_at?: string;
        };
      };
      social_posts: {
        Row: {
          id: string;
          content: string;
          platforms: string[];
          status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'published';
          scheduled_date?: string;
          publish_date?: string;
          created_by: string;
          approved_by?: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          platforms: string[];
          status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'published';
          scheduled_date?: string;
          publish_date?: string;
          created_by: string;
          approved_by?: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          platforms?: string[];
          status?: 'draft' | 'pending' | 'approved' | 'scheduled' | 'published';
          scheduled_date?: string;
          publish_date?: string;
          created_by?: string;
          approved_by?: string;
          project_id?: string;
          created_at?: string;
        };
      };
      knowledge_files: {
        Row: {
          id: string;
          file_name: string;
          category: string;
          tags: string[];
          file_type: string;
          file_size: string;
          url: string;
          uploaded_by: string;
          project_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_name: string;
          category: string;
          tags: string[];
          file_type: string;
          file_size: string;
          url: string;
          uploaded_by: string;
          project_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          file_name?: string;
          category?: string;
          tags?: string[];
          file_type?: string;
          file_size?: string;
          url?: string;
          uploaded_by?: string;
          project_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
