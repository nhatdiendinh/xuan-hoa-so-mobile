import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import type { ReactNode } from "react";
import App from "./app/App";
import { AuthProvider } from "./services/auth";
import { ToastProvider } from "./components/common/Overlays";
import { PermissionGuard, RequireAuth } from "./components/common/Guards";
import { DashboardLayout, type PageMeta } from "./layouts/DashboardLayout";
import type { Action, Module } from "./types";

import Login from "./pages/auth/Login";
import Overview from "./pages/dashboard/Overview";
import Tasks from "./pages/dashboard/Tasks";
import ContentList from "./pages/content/ContentList";
import ContentEditor from "./pages/content/ContentEditor";
import FeedbackList from "./pages/feedback/FeedbackList";
import FeedbackDetail from "./pages/feedback/FeedbackDetail";
import NeighborhoodList from "./pages/neighborhoods/NeighborhoodList";
import NeighborhoodDetail from "./pages/neighborhoods/NeighborhoodDetail";
import WasteSchedulePage from "./pages/waste/WasteSchedule";
import Surveys from "./pages/surveys/Surveys";
import MediaLibrary from "./pages/media/MediaLibrary";
import Utilities from "./pages/utilities/Utilities";
import Preview from "./pages/preview/Preview";
import Reports from "./pages/reports/Reports";
import Users from "./pages/users/Users";
import Roles from "./pages/users/Roles";
import Settings from "./pages/settings/Settings";
import LedWall from "./pages/led/LedWall";
import MobileTasks from "./pages/mobile/MobileTasks";
import MobileContent from "./pages/mobile/MobileContent";
import MobileComposer from "./pages/mobile/MobileComposer";
import MobileFeedback from "./pages/mobile/MobileFeedback";
import MobileNotifications from "./pages/mobile/MobileNotifications";
import MobileProfile from "./pages/mobile/MobileProfile";

const HOME = { label: "Trang chủ", to: "/dashboard/overview" };

/** Bọc trang dashboard: kiểm tra đăng nhập, kiểm tra quyền, dựng layout */
function Page({ meta, module, action = "view", children }: {
  meta: PageMeta; module: Module; action?: Action; children: ReactNode;
}) {
  return (
    <RequireAuth>
      <DashboardLayout meta={meta}>
        <PermissionGuard module={module} action={action}>{children}</PermissionGuard>
      </DashboardLayout>
    </RequireAuth>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Trang công khai cho người dân */}
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />

            {/* Dashboard điều hành */}
            <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
            <Route path="/dashboard/overview" element={
              <Page module="overview" meta={{ title: "Tổng quan điều hành", breadcrumb: [HOME, { label: "Điều hành" }, { label: "Tổng quan" }] }}>
                <Overview />
              </Page>
            } />
            <Route path="/dashboard/tasks" element={
              <Page module="tasks" meta={{ title: "Công việc cần xử lý", breadcrumb: [HOME, { label: "Điều hành" }, { label: "Công việc" }] }}>
                <Tasks />
              </Page>
            } />

            <Route path="/dashboard/content" element={<Navigate to="/dashboard/content/news" replace />} />
            <Route path="/dashboard/content/news" element={
              <Page module="content" meta={{ title: "Tin tức", breadcrumb: [HOME, { label: "Nội dung" }, { label: "Tin tức" }] }}>
                <ContentList type="news" title="Danh sách tin tức" />
              </Page>
            } />
            <Route path="/dashboard/content/announcements" element={
              <Page module="content" meta={{ title: "Thông báo", breadcrumb: [HOME, { label: "Nội dung" }, { label: "Thông báo" }] }}>
                <ContentList type="announcement" title="Danh sách thông báo" />
              </Page>
            } />
            <Route path="/dashboard/content/events" element={
              <Page module="content" meta={{ title: "Lịch hoạt động", breadcrumb: [HOME, { label: "Nội dung" }, { label: "Lịch hoạt động" }] }}>
                <ContentList type="event" title="Danh sách hoạt động" />
              </Page>
            } />
            <Route path="/dashboard/content/banners" element={
              <Page module="content" meta={{ title: "Banner trang chủ", breadcrumb: [HOME, { label: "Hệ thống" }, { label: "Banner" }] }}>
                <ContentList type="banner" title="Danh sách banner" />
              </Page>
            } />
            <Route path="/dashboard/content/create" element={
              <Page module="content" action="create" meta={{ title: "Tạo nội dung", breadcrumb: [HOME, { label: "Nội dung", to: "/dashboard/content/news" }, { label: "Tạo mới" }] }}>
                <ContentEditor />
              </Page>
            } />
            <Route path="/dashboard/content/:id/edit" element={
              <Page module="content" action="edit" meta={{ title: "Chỉnh sửa nội dung", breadcrumb: [HOME, { label: "Nội dung", to: "/dashboard/content/news" }, { label: "Chỉnh sửa" }] }}>
                <ContentEditor />
              </Page>
            } />
            <Route path="/dashboard/digital-literacy" element={
              <Page module="literacy" meta={{ title: "Bình dân học vụ số", breadcrumb: [HOME, { label: "Nội dung" }, { label: "Bình dân học vụ số" }] }}>
                <ContentList type="literacy" title="Danh sách bài học số" />
              </Page>
            } />

            <Route path="/dashboard/feedback" element={
              <Page module="feedback" meta={{ title: "Phản ánh kiến nghị", breadcrumb: [HOME, { label: "Điều hành" }, { label: "Phản ánh kiến nghị" }] }}>
                <FeedbackList />
              </Page>
            } />
            <Route path="/dashboard/feedback/:id" element={
              <Page module="feedback" meta={{ title: "Chi tiết phản ánh", breadcrumb: [HOME, { label: "Phản ánh kiến nghị", to: "/dashboard/feedback" }, { label: "Chi tiết" }] }}>
                <FeedbackDetail />
              </Page>
            } />

            <Route path="/dashboard/neighborhoods" element={
              <Page module="neighborhoods" meta={{ title: "Khu phố", breadcrumb: [HOME, { label: "Địa bàn" }, { label: "Khu phố" }] }}>
                <NeighborhoodList />
              </Page>
            } />
            <Route path="/dashboard/neighborhoods/:id" element={
              <Page module="neighborhoods" meta={{ title: "Chi tiết khu phố", breadcrumb: [HOME, { label: "Khu phố", to: "/dashboard/neighborhoods" }, { label: "Chi tiết" }] }}>
                <NeighborhoodDetail />
              </Page>
            } />

            <Route path="/dashboard/waste-schedule" element={
              <Page module="waste" meta={{ title: "Lịch thu gom rác", breadcrumb: [HOME, { label: "Địa bàn" }, { label: "Lịch thu gom rác" }] }}>
                <WasteSchedulePage />
              </Page>
            } />
            <Route path="/dashboard/surveys" element={
              <Page module="surveys" meta={{ title: "Khảo sát - đăng ký", breadcrumb: [HOME, { label: "Hệ thống" }, { label: "Khảo sát" }] }}>
                <Surveys />
              </Page>
            } />
            <Route path="/dashboard/media" element={
              <Page module="media" meta={{ title: "Thư viện ảnh - video", breadcrumb: [HOME, { label: "Nội dung" }, { label: "Thư viện" }] }}>
                <MediaLibrary />
              </Page>
            } />
            <Route path="/dashboard/utilities" element={
              <Page module="utilities" meta={{ title: "Tiện ích và bản đồ", breadcrumb: [HOME, { label: "Địa bàn" }, { label: "Tiện ích" }] }}>
                <Utilities />
              </Page>
            } />
            <Route path="/dashboard/preview" element={
              <Page module="preview" meta={{ title: "Xem trước trang", breadcrumb: [HOME, { label: "Hệ thống" }, { label: "Xem trước trang" }] }}>
                <Preview />
              </Page>
            } />
            <Route path="/dashboard/reports" element={
              <Page module="reports" meta={{ title: "Thống kê - báo cáo", breadcrumb: [HOME, { label: "Hệ thống" }, { label: "Báo cáo" }] }}>
                <Reports />
              </Page>
            } />
            <Route path="/dashboard/users" element={
              <Page module="users" meta={{ title: "Người dùng", breadcrumb: [HOME, { label: "Hệ thống" }, { label: "Người dùng" }] }}>
                <Users />
              </Page>
            } />
            <Route path="/dashboard/roles" element={
              <Page module="users" meta={{ title: "Vai trò và phân quyền", breadcrumb: [HOME, { label: "Hệ thống" }, { label: "Phân quyền" }] }}>
                <Roles />
              </Page>
            } />
            <Route path="/dashboard/settings" element={
              <Page module="settings" meta={{ title: "Cấu hình hệ thống", breadcrumb: [HOME, { label: "Hệ thống" }, { label: "Cấu hình" }] }}>
                <Settings />
              </Page>
            } />

            {/* Màn hình LED điều hành 3840x2160 */}
            <Route path="/dashboard/led" element={<RequireAuth><LedWall /></RequireAuth>} />
            <Route path="/led" element={<RequireAuth><LedWall /></RequireAuth>} />

            {/* Giao diện điện thoại cho Trưởng khu phố */}
            <Route path="/mobile" element={<Navigate to="/mobile/tasks" replace />} />
            <Route path="/mobile/tasks" element={<RequireAuth><MobileTasks /></RequireAuth>} />
            <Route path="/mobile/content" element={<RequireAuth><MobileContent /></RequireAuth>} />
            <Route path="/mobile/content/create" element={<RequireAuth><MobileComposer /></RequireAuth>} />
            <Route path="/mobile/feedback" element={<RequireAuth><MobileFeedback /></RequireAuth>} />
            <Route path="/mobile/notifications" element={<RequireAuth><MobileNotifications /></RequireAuth>} />
            <Route path="/mobile/profile" element={<RequireAuth><MobileProfile /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
