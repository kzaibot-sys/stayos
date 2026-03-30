"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
}

export function ImageUpload({ value, onChange, maxFiles = 10 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remaining = maxFiles - value.length

      if (remaining <= 0) {
        toast.error(`Максимум ${maxFiles} фото`)
        return
      }

      const toUpload = fileArray.slice(0, remaining)
      if (toUpload.length < fileArray.length) {
        toast.warning(`Загружено только ${toUpload.length} из ${fileArray.length} файлов (лимит ${maxFiles})`)
      }

      setIsUploading(true)
      try {
        const formData = new FormData()
        toUpload.forEach((file) => formData.append("files", file))

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error ?? "Ошибка загрузки")
        }

        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((err: string) => toast.error(err))
        }

        if (data.urls && data.urls.length > 0) {
          onChange([...value, ...data.urls])
          toast.success(`${data.urls.length} фото загружено`)
        }
      } catch (err: any) {
        toast.error(err.message ?? "Ошибка при загрузке фото")
      } finally {
        setIsUploading(false)
        // Reset file input so the same file can be re-uploaded if needed
        if (inputRef.current) inputRef.current.value = ""
      }
    },
    [value, onChange, maxFiles]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    const next = [...value]
    next.splice(index, 1)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-400 bg-white"
        } ${isUploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {isUploading ? (
          <Loader2 className="size-8 text-blue-500 animate-spin" />
        ) : (
          <Upload className="size-8 text-gray-400" />
        )}
        <p className="text-sm text-gray-500 text-center">
          {isUploading
            ? "Загрузка..."
            : "Перетащите фото сюда или кликните для выбора"}
        </p>
        <p className="text-xs text-gray-400">
          JPEG, PNG, WebP — до 5 МБ каждый, максимум {maxFiles} фото
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Фото ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Удалить фото ${i + 1}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          {value.length} из {maxFiles} фото
        </p>
      )}
    </div>
  )
}
