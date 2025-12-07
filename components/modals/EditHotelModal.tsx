"use client";

import { useState, useEffect, useRef } from "react";
import { Hotel } from "@/app/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner"; 

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import Image from "next/image";

const hotelSchema = z.object({
  name: z.string().min(1, "Tên khách sạn không được để trống"),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  description: z.string().optional(),
  starRating: z.number().min(1).max(5),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]),
  amenities: z.array(z.string()).optional(),
});

type HotelFormData = z.infer<typeof hotelSchema>;

interface EditHotelModalProps {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedHotel: Hotel) => void;
}

export function EditHotelModal({
  hotel,
  open,
  onOpenChange,
  onSuccess,
}: EditHotelModalProps) {
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HotelFormData>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (hotel && open) {
      reset({
        name: hotel.name,
        address: hotel.address,
        description: hotel.description || "",
        starRating: hotel.starRating,
        status: (hotel.status as "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED") ?? "DRAFT",
      });
      setAmenities(hotel.amenities || []);
      setImages(hotel.images || []);
    } else {
      reset();
      setAmenities([]);
      setImages([]);
    }
  }, [hotel, open, reset]);

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
          toast.error("Upload ảnh thất bại");
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
      toast.error("URL không hợp lệ");
    }
  };

  const removeImage = (img: string) => {
    setImages((prev) => prev.filter((i) => i !== img));
  };

  const onSubmit = async (data: HotelFormData) => {
    try {
      const res = await fetch(`/api/hotels/${hotel?._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amenities, images }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      const updatedHotel = await res.json();

      toast.success("Cập nhật khách sạn thành công!");
      onSuccess?.(updatedHotel);
      onOpenChange(false);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-6xl max-h-[95vh] overflow-y-auto p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl">Chỉnh sửa khách sạn</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Cập nhật thông tin khách sạn {hotel?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base font-semibold">Tên khách sạn *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nhập tên khách sạn"
                className="text-base h-11 px-4"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="starRating" className="text-base font-semibold">Số sao *</Label>
              <Input
                id="starRating"
                type="number"
                min="1"
                max="5"
                {...register("starRating", { valueAsNumber: true })}
                className="text-base h-11 px-4"
              />
              {errors.starRating && (
                <p className="text-sm text-destructive">
                  {errors.starRating.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="address" className="text-base font-semibold">Địa chỉ *</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Số nhà, đường, phường/xã..."
              className="text-base h-11 px-4"
            />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-base font-semibold">Mô tả</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={5}
              placeholder="Mô tả về khách sạn..."
              className="text-base px-4 py-3"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Trạng thái</Label>
            <Select
              defaultValue={hotel?.status}
              onValueChange={(value) =>
                setValue("status", value as "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED")
              }
            >
              <SelectTrigger className="text-base h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="SUBMITTED">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Bị từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Tiện ích</Label>
            <div className="flex gap-3">
              <Input
                placeholder="Thêm tiện ích (Enter để thêm)"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                className="text-base h-11 px-4"
              />
              <Button type="button" onClick={addAmenity} className="px-6">
                Thêm
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {amenities.map((item) => (
                <Badge key={item} variant="secondary" className="px-4 py-2 text-base">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeAmenity(item)}
                    className="ml-3 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t pt-8">
            <Label className="text-base font-semibold">Hình ảnh</Label>

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
              className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/5 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary"
            >
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-16 h-16 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    Kéo thả ảnh vào đây
                  </p>
                  <p className="text-base text-muted-foreground mt-2">
                    hoặc click để chọn từ máy tính
                  </p>
                </div>
                {uploading && (
                  <p className="text-sm text-primary animate-pulse font-semibold mt-2">Đang upload...</p>
                )}
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


            <div className="flex gap-3">
              <Input
                placeholder="Dán URL ảnh công khai vào đây và Enter"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageByUrl())}
                className="text-base h-11 px-4"
              />
              <Button type="button" onClick={() => addImageByUrl()} className="px-6">
                Thêm URL
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
              {images.map((img) => (
                <div key={img} className="relative border rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-shadow h-36">
                  <Image src={img} alt="preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-full text-base text-muted-foreground text-center py-12">Chưa có ảnh</div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}