"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";

const createHotelSchema = z.object({
  name: z.string().min(1, "Tên khách sạn không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  description: z.string().optional(),
  starRating: z.number().min(1).max(5),
  totalRooms: z.number().min(1),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  amenities: z.array(z.string()).optional(),
});

type CreateHotelFormData = z.infer<typeof createHotelSchema>;

interface CreateHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateHotelModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateHotelModalProps) {
  const { user, fetchWithAuth } = useAuth();
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
    setValue,
  } = useForm<CreateHotelFormData>({
    resolver: zodResolver(createHotelSchema),
    defaultValues: {
      starRating: 3,
      totalRooms: 10,
      checkInTime: "14:00",
      checkOutTime: "12:00",
    },
  });

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      const newAmenities = [...amenities, amenityInput.trim()];
      setAmenities(newAmenities);
      setValue("amenities", newAmenities);
      setAmenityInput("");
    }
  };

  const removeAmenity = (item: string) => {
    const newAmenities = amenities.filter((a) => a !== item);
    setAmenities(newAmenities);
    setValue("amenities", newAmenities);
  };

  const onSubmit = async (data: CreateHotelFormData) => {
    try {
      setIsSubmitting(true);

      if (!user?._id) throw new Error("User not authenticated");

      const body = {
        ...data,
        amenities: amenities,
        images,
        ownerId: user._id,
        status: "DRAFT",
      };

      const response = await fetchWithAuth("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to create hotel");
      }

      reset();
      setAmenities([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating hotel:", error);
      alert("Lỗi tạo khách sạn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArr = Array.from(files);
    const totalFiles = fileArr.length;
    let uploadedCount = 0;

    fileArr.forEach((file) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          uploadedCount++;
          if (data.url) setImages((prev) => [...prev, data.url]);
          if (uploadedCount === totalFiles) setUploading(false);
        })
        .catch((err) => {
          console.error(err);
          uploadedCount++;
          if (uploadedCount === totalFiles) setUploading(false);
          alert("Upload ảnh thất bại");
        });
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const addImageByUrl = (url?: string) => {
    const u = url ?? imageUrlInput.trim();
    if (!u) return;
    try {
      const _parsed = new URL(u);
      if (!_parsed) throw new Error("invalid");
      setImages((prev) => [...prev, u]);
      setImageUrlInput("");
    } catch (err) {
      console.error(err);
      alert("URL không hợp lệ");
    }
  };

  const removeImage = (img: string) => {
    setImages((prev) => prev.filter((i) => i !== img));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo khách sạn mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin khách sạn. Khách sạn sẽ được tạo với trạng thái DRAFT.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tên khách sạn */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên khách sạn *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nhập tên khách sạn"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ *</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Nhập địa chỉ"
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Nhập mô tả khách sạn"
              rows={3}
            />
          </div>

          {/* Đánh giá sao */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starRating">Đánh giá sao (1-5) *</Label>
              <Input
                id="starRating"
                type="number"
                min="1"
                max="5"
                {...register("starRating", { valueAsNumber: true })}
              />
              {errors.starRating && (
                <p className="text-sm text-red-500">
                  {errors.starRating.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalRooms">Số phòng *</Label>
              <Input
                id="totalRooms"
                type="number"
                min="1"
                {...register("totalRooms", { valueAsNumber: true })}
              />
              {errors.totalRooms && (
                <p className="text-sm text-red-500">
                  {errors.totalRooms.message}
                </p>
              )}
            </div>
          </div>

          {/* Giờ vào/ra */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Giờ nhận phòng</Label>
              <Input
                id="checkInTime"
                type="time"
                {...register("checkInTime")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Giờ trả phòng</Label>
              <Input
                id="checkOutTime"
                type="time"
                {...register("checkOutTime")}
              />
            </div>
          </div>

          {/* Tiện nghi */}
          <div className="space-y-2">
            <Label>Tiện nghi</Label>
            <div className="flex gap-2">
              <Input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Nhập tiện nghi"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                Thêm
              </Button>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <button
                      onClick={() => removeAmenity(amenity)}
                      type="button"
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Hình ảnh */}
          <div className="space-y-2">
            <Label>Hình ảnh</Label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("bg-primary/5", "border-primary");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-primary/5", "border-primary");
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("bg-primary/5", "border-primary");
                handleDrop(e);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/5 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary"
            >
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">Kéo thả ảnh vào đây hoặc click để chọn</p>
                {uploading && <p className="text-sm text-primary animate-pulse">Đang upload...</p>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="sr-only"
              />
            </div>

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Dán URL ảnh công khai vào đây và Enter"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageByUrl())}
              />
              <Button type="button" onClick={() => addImageByUrl()} className="px-4">Thêm URL</Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {images.map((img) => (
                <div key={img} className="relative border rounded-lg overflow-hidden group h-28">
                  <Image src={img} alt="preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-full text-sm text-muted-foreground text-center py-6">Chưa có ảnh</div>
              )}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isFormSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting || isFormSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo khách sạn"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
