"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: boolean
  parentId?: string
  name: string
  description: string
  pageTitle: string
  metaDescription: string
}

export default function AddCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState<Category>({
    DEPT: "",
    TYP: "",
    SUBTYP_1: "",
    SUBTYP_2: "",
    SUBTYP_3: "",
    WEB_URL: "",
    ACTIVE: true,
    name: "",
    description: "",
    pageTitle: "",
    metaDescription: "",
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/catalog/categories")
        if (!response.ok) throw new Error("Failed to fetch categories")
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        })
      }
    }
    fetchCategories()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/admin/catalog/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      })

      if (!response.ok) throw new Error("Failed to create category")

      toast({
        title: "Success",
        description: "Category created successfully",
      })
      router.push("/admin/catalog/categories")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/catalog/categories")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Add Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={category.name}
              onChange={(e) => setCategory({ ...category, name: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="parent">Parent Category</Label>
            <Select
              value={category.parentId}
              onValueChange={(value) => setCategory({ ...category, parentId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.DEPT} value={cat.DEPT}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={category.description}
              onChange={(e) => setCategory({ ...category, description: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pageTitle">Page Title</Label>
            <Input
              id="pageTitle"
              value={category.pageTitle}
              onChange={(e) => setCategory({ ...category, pageTitle: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Input
              id="metaDescription"
              value={category.metaDescription}
              onChange={(e) => setCategory({ ...category, metaDescription: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="webUrl">Web URL</Label>
            <Input
              id="webUrl"
              value={category.WEB_URL}
              onChange={(e) => setCategory({ ...category, WEB_URL: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={category.ACTIVE}
              onCheckedChange={(checked: boolean) =>
                setCategory({ ...category, ACTIVE: checked })
              }
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/catalog/categories")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  )
} 