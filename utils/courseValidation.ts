// Course validation utilities

interface CourseValidationData {
  instructor?: {
    first_name: string;
    last_name: string;
    email: string;
    clerk_id: string;
    profile_image_url: string;
  };
  organization?: {
    name: string;
    logo?: string;
    _id: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates that either an instructor or organization is selected for a course
 */
export function validateCourseInstructorOrOrganization(
  data: CourseValidationData,
): ValidationResult {
  const errors: string[] = [];

  // Check if neither instructor nor organization is provided
  if (!data.instructor && !data.organization) {
    errors.push(
      "Either an instructor or organization must be selected for the course.",
    );
  }

  // If instructor is provided, validate required fields
  if (data.instructor) {
    if (!data.instructor.first_name?.trim()) {
      errors.push("Instructor first name is required.");
    }
    if (!data.instructor.last_name?.trim()) {
      errors.push("Instructor last name is required.");
    }
    if (!data.instructor.email?.trim()) {
      errors.push("Instructor email is required.");
    }
  }

  // If organization is provided, validate required fields
  if (data.organization) {
    if (!data.organization.name?.trim()) {
      errors.push("Organization name is required.");
    }
    if (!data.organization._id?.trim()) {
      errors.push("Organization ID is required.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets the display name for course attribution (instructor or organization)
 */
export function getCourseAttributionName(data: CourseValidationData): string {
  if (data.instructor) {
    return `${data.instructor.first_name} ${data.instructor.last_name}`;
  }

  if (data.organization) {
    return data.organization.name;
  }

  return "Unknown";
}

/**
 * Gets the display type for course attribution
 */
export function getCourseAttributionType(
  data: CourseValidationData,
): "instructor" | "organization" | "unknown" {
  if (data.instructor) {
    return "instructor";
  }

  if (data.organization) {
    return "organization";
  }

  return "unknown";
}
