"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import CustomButton from "@/components/custom/customButton";
import SimpleSelectDropdown, {
  Option,
} from "@/components/custom/SimpleSelectDropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  ShoppingCart,
  BookOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";

const SORT_OPTIONS: Option[] = [
  { value: "", label: "Sort By" },
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
];

interface UserStats {
  totalUsers: number;
  currentlyActiveUsers: number; // Users currently signed in
  engagedUsers: number; // Users with enrollments/purchases/progress
  inactiveUsers: number;
  roleStats: {
    admin: number;
    user: number;
    instructor: number;
    student: number;
  };
  onboardingComplete: number;
  onboardingIncomplete: number;
  usersWithEnrollments: number;
  usersWithPurchases: number;
  recentUsers: number;
}

interface User {
  _id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image_url?: string;
  role: string;
  created_at: string;
  onboardingComplete?: boolean;
  stats: {
    enrolledCourses: number;
    purchasedCourses: number;
    coursesInProgress: number;
  };
  enrolledCourses: any[];
  purchasedCourses: any[];
}

interface UserDetails {
  user: {
    _id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    profile_image_url?: string;
    role: string;
    created_at: string;
    bio?: string;
    onboardingComplete?: boolean;
    enrolledCourses: any[];
    purchasedCourses: any[];
    completedCourses: any[];
    courseProgress: any[];
    stats: {
      enrolledCourses: number;
      purchasedCourses: number;
      completedCourses: number;
      coursesInProgress: number;
      totalVideosWatched: number;
      totalWatchTime: string;
    };
  };
}

function UsersPage() {
  const [sort, setSort] = useState("latest");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/users/stats");
        const data = await response.json();
        // Ensure roleStats always has the expected structure
        if (data && !data.roleStats) {
          data.roleStats = {
            admin: 0,
            user: 0,
            instructor: 0,
            student: 0,
          };
        }
        setStats(data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
        // Set default stats on error
        setStats({
          totalUsers: 0,
          currentlyActiveUsers: 0,
          engagedUsers: 0,
          inactiveUsers: 0,
          roleStats: {
            admin: 0,
            user: 0,
            instructor: 0,
            student: 0,
          },
          onboardingComplete: 0,
          onboardingIncomplete: 0,
          usersWithEnrollments: 0,
          usersWithPurchases: 0,
          recentUsers: 0,
        });
      }
    };

    fetchStats();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `/api/admin/users?sort=${sort}&page=1&limit=10`,
        );
        const data = await response.json();
        setUsers(data.users);
        setPage(1);
        setHasMore(data.users.length >= 10);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [sort]);

  const loadMoreUsers = async () => {
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/admin/users?sort=${sort}&page=${nextPage}&limit=10`,
      );
      const data = await response.json();
      setUsers((prev) => [...prev, ...data.users]);
      setPage(nextPage);
      if (data.users.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Error loading more users:", error);
    }
  };

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  const handleUserClick = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    onOpen();

    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "danger";
      case "instructor":
        return "primary";
      case "student":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <section className="px-10 py-10">
      <h1 className="custom-h1">Users Dashboard</h1>

      {/* Analytics Cards */}
      {stats && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-[#111] text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-white/60" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-[#111] text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Currently Active</p>
                  <p className="text-2xl font-bold">
                    {stats.currentlyActiveUsers}
                  </p>
                  <p className="text-xs text-white/40">Signed in now</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-400" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-[#111] text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Engaged Users</p>
                  <p className="text-2xl font-bold">{stats.engagedUsers}</p>
                  <p className="text-xs text-white/40">With activity</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-400" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-[#111] text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Inactive Users</p>
                  <p className="text-2xl font-bold">{stats.inactiveUsers}</p>
                </div>
                <UserX className="h-8 w-8 text-red-400" />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-[#111] text-white">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">Students</p>
                  <p className="text-2xl font-bold">
                    {stats.roleStats?.student || 0}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-400" />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Users List Header */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Users</h3>
          <p className="text-white/50">
            {stats?.totalUsers || 0} users registered
          </p>
        </div>
        <div className="w-56">
          <SimpleSelectDropdown
            label="Sort By"
            options={SORT_OPTIONS}
            defaultValue="latest"
            onChange={handleSortChange}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="mt-6 grid gap-4">
        {users.map((user) => (
          <Card
            key={user._id}
            className="cursor-pointer bg-[#0f0f0f] transition-colors hover:bg-[#151515]"
            onClick={() => handleUserClick(user._id)}
          >
            <CardBody className="flex items-center gap-4 p-4">
              <div className="relative">
                <Image
                  src={user.profile_image_url || "/avatar.png"}
                  alt="profile"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                {user.onboardingComplete && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-[#0f0f0f]" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-white">
                  {user.first_name || user.username} {user.last_name || ""}
                </p>
                <p className="text-sm text-white/50">{user.email}</p>
                <div className="mt-1 flex gap-4 text-xs text-white/40">
                  <span>{user.stats.enrolledCourses} enrolled</span>
                  <span>{user.stats.purchasedCourses} purchased</span>
                  <span>{user.stats.coursesInProgress} in progress</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Chip color={getRoleColor(user.role)} variant="flat" size="sm">
                  {user.role}
                </Chip>
                <p className="text-xs text-white/40">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <CustomButton onClick={loadMoreUsers}>Load More</CustomButton>
        </div>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-white dark:bg-gray-900",
          header: "border-b border-gray-200 dark:border-gray-700",
          body: "py-6",
          footer: "border-t border-gray-200 dark:border-gray-700",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                User Details
              </ModalHeader>
              <ModalBody>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  userDetails && (
                    <>
                      {/* User Profile Section */}
                      <div className="flex items-center gap-4">
                        <Image
                          src={
                            userDetails.user.profile_image_url || "/avatar.png"
                          }
                          alt="profile"
                          width={80}
                          height={80}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="text-xl font-bold">
                            {userDetails.user.first_name ||
                              userDetails.user.username}{" "}
                            {userDetails.user.last_name || ""}
                          </p>
                          <p className="text-sm text-gray-500">
                            {userDetails.user.email}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Chip
                              color={getRoleColor(userDetails.user.role)}
                              variant="flat"
                              size="sm"
                            >
                              {userDetails.user.role}
                            </Chip>
                            {userDetails.user.onboardingComplete && (
                              <Chip color="success" variant="flat" size="sm">
                                Onboarded
                              </Chip>
                            )}
                          </div>
                        </div>
                      </div>

                      <Divider className="my-4" />

                      {/* Statistics Grid */}
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Card className="bg-gray-50">
                          <CardBody className="p-3">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Enrolled
                                </p>
                                <p className="text-lg font-bold">
                                  {userDetails.user.stats.enrolledCourses}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <Card className="bg-gray-50">
                          <CardBody className="p-3">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4 text-green-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Purchased
                                </p>
                                <p className="text-lg font-bold">
                                  {userDetails.user.stats.purchasedCourses}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <Card className="bg-gray-50">
                          <CardBody className="p-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-purple-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Completed
                                </p>
                                <p className="text-lg font-bold">
                                  {userDetails.user.stats.completedCourses}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <Card className="bg-gray-50">
                          <CardBody className="p-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Watch Time
                                </p>
                                <p className="text-lg font-bold">
                                  {userDetails.user.stats.totalWatchTime}
                                </p>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </div>

                      {/* Enrolled Courses */}
                      {userDetails.user.enrolledCourses &&
                        userDetails.user.enrolledCourses.length > 0 && (
                          <>
                            <Divider className="my-4" />
                            <div>
                              <h4 className="mb-2 font-semibold">
                                Enrolled Courses
                              </h4>
                              <div className="space-y-2">
                                {userDetails.user.enrolledCourses.map(
                                  (course: any, idx: number) => (
                                    <Card key={idx} className="bg-gray-50">
                                      <CardBody className="p-3">
                                        <div className="flex items-center gap-3">
                                          {course.course_image && (
                                            <Image
                                              src={course.course_image}
                                              alt={course.course_name}
                                              width={40}
                                              height={40}
                                              className="rounded"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">
                                              {course.course_name}
                                            </p>
                                            {course.price && (
                                              <p className="text-xs text-gray-500">
                                                ${course.price}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  ),
                                )}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Purchased Courses */}
                      {userDetails.user.purchasedCourses &&
                        userDetails.user.purchasedCourses.length > 0 && (
                          <>
                            <Divider className="my-4" />
                            <div>
                              <h4 className="mb-2 font-semibold">
                                Purchased Courses
                              </h4>
                              <div className="space-y-2">
                                {userDetails.user.purchasedCourses.map(
                                  (purchase: any, idx: number) => (
                                    <Card key={idx} className="bg-gray-50">
                                      <CardBody className="p-3">
                                        <div className="flex items-center gap-3">
                                          {purchase.courseId?.course_image && (
                                            <Image
                                              src={
                                                purchase.courseId.course_image
                                              }
                                              alt={
                                                purchase.courseId.course_name
                                              }
                                              width={40}
                                              height={40}
                                              className="rounded"
                                            />
                                          )}
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">
                                              {purchase.courseId?.course_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              Purchased:{" "}
                                              {new Date(
                                                purchase.purchasedAt,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  ),
                                )}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Course Progress */}
                      {userDetails.user.courseProgress &&
                        userDetails.user.courseProgress.length > 0 && (
                          <>
                            <Divider className="my-4" />
                            <div>
                              <h4 className="mb-2 font-semibold">
                                Course Progress
                              </h4>
                              <div className="space-y-2">
                                {userDetails.user.courseProgress.map(
                                  (progress: any, idx: number) => (
                                    <Card key={idx} className="bg-gray-50">
                                      <CardBody className="p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            {progress.course?.course_image && (
                                              <Image
                                                src={
                                                  progress.course.course_image
                                                }
                                                alt={
                                                  progress.course.course_name
                                                }
                                                width={40}
                                                height={40}
                                                className="rounded"
                                              />
                                            )}
                                            <div>
                                              <p className="text-sm font-medium">
                                                {progress.course?.course_name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {progress.watchedVideos
                                                  ?.length || 0}{" "}
                                                videos watched
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  ),
                                )}
                              </div>
                            </div>
                          </>
                        )}
                    </>
                  )
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}

export default UsersPage;
