# Cold Start Recommendations - Implementation Guide

## Overview

This implementation solves the "cold start" problem for new users by capturing their interests during onboarding and providing instant personalized course recommendations before they have any activity history.

## Architecture

### 🎯 How It Works

The system uses a **3-tier progressive recommendation strategy**:

1. **Cold Start (0-2 interactions)**: Uses onboarding preferences to recommend courses
2. **Warm Start (3-10 interactions)**: Blends preferences (40%) + collaborative (30%) + trending (30%)
3. **Full Personalization (10+ interactions)**: Uses hybrid algorithm (collaborative 50% + content-based 35% + trending 15%)

---

## 📁 Files Created/Modified

### New Files Created

1. **`models/userPreferences.js`** - User preferences schema
   - Stores user interests, skill level, price range
   - Tracks onboarding completion status

2. **`app/api/(user)/preferences/route.ts`** - Preferences API endpoints
   - GET: Fetch user preferences
   - POST: Create new preferences (during onboarding)
   - PUT: Update existing preferences

3. **`components/ui/onboarding-model-enhanced.tsx`** - Enhanced onboarding component
   - 3-step onboarding flow
   - Interactive category selection
   - Skill level and price range selection
   - Progress indicator

4. **`components/RecommendedCourses.tsx`** - Recommendations display component
   - Shows personalized recommendations with reason badges
   - Auto-refresh capability
   - Loading states with skeletons

5. **`app/(publicPages)/recommendations/page.tsx`** - Dedicated recommendations page
   - Full-page view of personalized recommendations

6. **`COLD_START_RECOMMENDATIONS_GUIDE.md`** - This guide

### Existing Files (Integration Points)

- **`lib/recommendationEngine.js`** - Already has cold-start logic (lines 459-611)
- **`app/api/recommendations/route.ts`** - Already calls the recommendation engine

---

## 🚀 How to Use

### For New Users (Cold Start Flow)

1. **User signs up** and sees the enhanced onboarding modal
2. **Step 1**: Welcome message
3. **Step 2**: Select interests (up to 5 categories)
4. **Step 3**: Set skill level and price range (optional)
5. **Completion**: Preferences are saved to database
6. **Result**: Immediate personalized recommendations based on preferences

### For Existing Users

- Continue to receive hybrid recommendations based on their activity
- Can update preferences via PUT `/api/(user)/preferences`

---

## 🔌 API Endpoints

### Get User Preferences
```typescript
GET /api/(user)/preferences
Authorization: Required (Clerk)

Response:
{
  "success": true,
  "preferences": {
    "userId": "user_123",
    "interests": [
      {
        "categoryId": "cat_123",
        "categoryName": "Web Development",
        "priority": 5
      }
    ],
    "skillLevel": "beginner",
    "priceRange": { "min": 0, "max": 100 },
    "completedOnboarding": true
  }
}
```

### Save User Preferences
```typescript
POST /api/(user)/preferences
Authorization: Required (Clerk)

Body:
{
  "interests": [
    {
      "categoryId": "cat_123",
      "categoryName": "Web Development"
    }
  ],
  "skillLevel": "beginner",
  "priceRange": { "min": 0, "max": 100 }
}

Response:
{
  "success": true,
  "preferences": { ... },
  "message": "Preferences saved successfully"
}
```

### Get Recommendations
```typescript
GET /api/recommendations?limit=20&refresh=false
Authorization: Required (Clerk)

Response:
{
  "success": true,
  "recommendations": [
    {
      "courseId": "course_123",
      "score": 8.5,
      "reason": "onboarding",
      "sources": ["user_preferences"],
      "course": {
        "_id": "course_123",
        "course_name": "JavaScript Masterclass",
        "slug": "javascript-masterclass",
        ...
      }
    }
  ]
}
```

---

## 🎨 UI Components

### Using the Enhanced Onboarding Component

```tsx
import { OnBoardingModelEnhanced } from "@/components/ui/onboarding-model-enhanced";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <OnBoardingModelEnhanced
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  );
}
```

### Using the Recommendations Component

```tsx
import RecommendedCourses from "@/components/RecommendedCourses";

function MyPage() {
  return (
    <RecommendedCourses
      limit={8}              // Number of courses to show (default: 8)
      showHeader={true}      // Show the header section (default: true)
      className="my-4"       // Optional CSS classes
    />
  );
}
```

---

## 🧪 Testing the Flow

### Test Cold Start (New User)

1. Create a new user account or clear existing preferences
2. Complete the onboarding flow and select interests
3. Navigate to `/recommendations` or view the home page
4. Verify you see courses matching your selected categories
5. Check that the reason badge shows "Based on your interests"

### Test Warm Start (3-10 interactions)

1. As a new user with preferences, interact with 3-5 courses (view, like, enroll)
2. Refresh recommendations
3. Verify you see a mix of preference-based, collaborative, and trending courses

### Test Full Personalization (10+ interactions)

1. Continue interacting with courses (10+ interactions)
2. Refresh recommendations
3. Verify you see hybrid recommendations with various reason badges

### Test API Endpoints

```bash
# Get user preferences
curl -X GET http://localhost:3000/api/(user)/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"

# Save preferences
curl -X POST http://localhost:3000/api/(user)/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "interests": [
      {
        "categoryId": "cat_123",
        "categoryName": "Web Development"
      }
    ],
    "skillLevel": "beginner",
    "priceRange": { "min": 0, "max": 100 }
  }'

# Get recommendations
curl -X GET http://localhost:3000/api/recommendations?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Configuration

### Recommendation Weights (in `lib/recommendationEngine.js`)

**Cold Start** (0-2 interactions):
- User preferences: 100%

**Warm Start** (3-10 interactions):
- Onboarding preferences: 40%
- Collaborative filtering: 30%
- Trending courses: 30%

**Full Personalization** (10+ interactions):
- Collaborative filtering: 50%
- Content-based: 35%
- Trending: 15%

### Priority Calculation

Interests are prioritized based on selection order:
- 1st selection: Priority 5
- 2nd selection: Priority 4
- 3rd selection: Priority 3
- 4th selection: Priority 2
- 5th selection: Priority 1

---

## 📊 Database Schema

### UserPreferences Model

```javascript
{
  userId: String,              // Clerk user ID (unique, indexed)
  interests: [
    {
      categoryId: ObjectId,    // Reference to CourseCategory
      categoryName: String,    // Category name for display
      priority: Number         // 1-5, based on selection order
    }
  ],
  skillLevel: String,          // "beginner" | "intermediate" | "advanced" | "all"
  priceRange: {
    min: Number,               // Minimum price
    max: Number                // Maximum price
  },
  completedOnboarding: Boolean, // Track if user completed onboarding
  lastUpdated: Date,           // When preferences were last updated
  createdAt: Date,             // Auto-generated timestamp
  updatedAt: Date              // Auto-generated timestamp
}
```

---

## 🎯 Key Features

### 1. **Smart Cold Start Resolution**
- New users get instant recommendations based on interests
- No need to wait for activity history to accumulate

### 2. **Progressive Enhancement**
- Smoothly transitions from preference-based to activity-based recommendations
- Blends multiple signals as user gains experience

### 3. **User Control**
- Users explicitly choose their interests during onboarding
- Can skip onboarding (falls back to trending courses)
- Preferences are updateable

### 4. **Visual Feedback**
- Reason badges show why each course was recommended
- Progress indicators during onboarding
- Loading skeletons for better UX

### 5. **Caching & Performance**
- Recommendations cached for 24 hours
- Manual refresh option available
- Efficient database queries with indexes

---

## 🔒 Security & Privacy

- All endpoints require Clerk authentication
- User preferences are private and user-specific
- No cross-user data leakage
- Preferences tied to `userId` from Clerk

---

## 🐛 Troubleshooting

### Issue: No recommendations showing

**Possible causes:**
1. User not authenticated - Check Clerk authentication
2. No categories in database - Populate CourseCategory collection
3. No published courses - Ensure courses have `status: "published"`
4. API error - Check server logs

### Issue: Onboarding not saving preferences

**Possible causes:**
1. API endpoint path incorrect - Check `/api/(user)/preferences`
2. Validation error - Ensure at least 1 interest is selected
3. Database connection - Check MongoDB connection

### Issue: Getting trending instead of preference-based recommendations

**Possible causes:**
1. User hasn't completed onboarding - Check `completedOnboarding` flag
2. No matching courses - Ensure courses exist in selected categories
3. Interaction count threshold - User might have 3+ interactions already

---

## 📈 Future Enhancements

Potential improvements to consider:

1. **A/B Testing**: Test different recommendation algorithms
2. **Explicit Feedback**: Allow users to rate recommendations
3. **Interest Decay**: Reduce weight of old preferences over time
4. **Multi-Goal Support**: Career goals, skill building, hobby learning
5. **Social Integration**: Recommendations from friends/colleagues
6. **Learning Paths**: Multi-course recommendations for specific goals
7. **Time-based Preferences**: Recommend based on available time
8. **Mobile App Integration**: Sync preferences across platforms

---

## 📝 Summary

This implementation provides a complete cold-start recommendation solution that:

✅ Captures user interests during onboarding
✅ Provides instant personalized recommendations for new users
✅ Smoothly transitions to hybrid recommendations as users engage
✅ Uses existing recommendation infrastructure
✅ Maintains backward compatibility with existing users
✅ Provides excellent UX with HeroUI components
✅ Includes comprehensive error handling and loading states

The solution integrates seamlessly with your existing recommendation engine and doesn't break any existing functionality.
