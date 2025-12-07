"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserRole } from "@/app/types";

const userFormSchema = z.object({
  fullName: z.string().min(2, "Tên phải ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(9, "Số điện thoại không hợp lệ"),
  username: z.string().min(3, "Username phải ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  confirmPassword: z.string(),
  role: z.enum(["client", "provider", "admin"] as const).refine(
    (val) => ["client", "provider", "admin"].includes(val),
    { message: "Vai trò không hợp lệ" }
  ),
  gender: z.string().min(1, "Vui lòng chọn giới tính"),
  age: z.number().int().min(18, "Tuổi phải ít nhất 18").max(100, "Tuổi không hợp lệ"),
  birthday: z.string().min(1, "Vui lòng chọn ngày sinh"),
  twoFactorEnabled: z.boolean(),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu không khớp",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userFormSchema>;

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSave: (data: UserFormData) => void;
}

export function EditUserModal({
  open,
  onOpenChange,
  user,
  onSave,
}: EditUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "client",
      gender: "",
      age: 18,
      birthday: "",
      twoFactorEnabled: false,
      address: "",
    },
  });

  const role = watch("role");
  const gender = watch("gender");
  const twoFactorEnabled = watch("twoFactorEnabled");

  useEffect(() => {
    if (user) {
      setValue("fullName", user.fullName);
      setValue("email", user.email);
      setValue("phone", user.phone);
      setValue("username", user.username);
      setValue("role", user.role as UserRole);
      setValue("gender", user.gender);
      setValue("age", user.age);
      setValue("birthday", user.birthday);
      setValue("twoFactorEnabled", user.twoFactorEnabled);
      setValue("address", user.address || "");
      // Clear password fields for edit mode
      setValue("password", "");
      setValue("confirmPassword", "");
    } else {
      reset();
    }
  }, [user, setValue, reset]);

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      onSave(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl">
            {user ? "Chỉnh sửa thông tin người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {user
              ? `Cập nhật thông tin của ${user.fullName}`
              : "Điền thông tin để tạo tài khoản người dùng mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-base font-semibold">
                Họ và tên *
              </Label>
              <Input
                id="fullName"
                placeholder="Nhập họ và tên"
                {...register("fullName")}
                className="text-base h-11 px-4"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="gender" className="text-base font-semibold">
                Giới tính *
              </Label>
              <Select value={gender} onValueChange={(value) => setValue("gender", value)}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...register("email")}
                className="text-base h-11 px-4"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="phone" className="text-base font-semibold">
                Số điện thoại *
              </Label>
              <Input
                id="phone"
                placeholder="0901234567"
                {...register("phone")}
                className="text-base h-11 px-4"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-base font-semibold">
                Tên đăng nhập *
              </Label>
              <Input
                id="username"
                placeholder="username"
                {...register("username")}
                className="text-base h-11 px-4"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="age" className="text-base font-semibold">
                Tuổi *
              </Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                {...register("age", { valueAsNumber: true })}
                className="text-base h-11 px-4"
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold">
                Mật khẩu {!user && "*"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={user ? "Để trống nếu không muốn thay đổi" : "Nhập mật khẩu"}
                {...register("password")}
                className="text-base h-11 px-4"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-base font-semibold">
                Xác nhận mật khẩu {!user && "*"}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={user ? "Để trống nếu không muốn thay đổi" : "Nhập lại mật khẩu"}
                {...register("confirmPassword")}
                className="text-base h-11 px-4"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="birthday" className="text-base font-semibold">
                Ngày sinh *
              </Label>
              <Input
                id="birthday"
                type="date"
                {...register("birthday")}
                className="text-base h-11 px-4"
              />
              {errors.birthday && (
                <p className="text-sm text-red-500">{errors.birthday.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="role" className="text-base font-semibold">
                Vai trò *
              </Label>
              <Select value={role} onValueChange={(value) => setValue("role", value as UserRole)}>
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Khách hàng</SelectItem>
                  <SelectItem value="provider">Nhà cung cấp</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="address" className="text-base font-semibold">
                Địa chỉ
              </Label>
              <Input
                id="address"
                placeholder="Số nhà, đường, phường/xã..."
                {...register("address")}
                className="text-base h-11 px-4"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="twoFactorEnabled" className="text-base font-semibold">
                Xác thực 2 bước
              </Label>
              <Select 
                value={String(twoFactorEnabled)} 
                onValueChange={(value) => setValue("twoFactorEnabled", value === "true")}
              >
                <SelectTrigger className="text-base h-11">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Không bật</SelectItem>
                  <SelectItem value="true">Bật</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
