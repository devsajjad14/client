"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface Category {
  WEB_TAXONOMY_ID: number
  DEPT: string
  TYP: string
  SUBTYP_1: string
  SUBTYP_2: string
  SUBTYP_3: string
  WEB_URL: string
  ACTIVE: number
  SHORT_DESC: string
  LONG_DESCRIPTION: string
  META_TAGS?: string
  SORT_POSITION?: string
}

export default function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<Category>({
    WEB_TAXONOMY_ID: 0,
    DEPT: "",
    TYP: "",
    SUBTYP_1: "",
    SUBTYP_2: "",
    SUBTYP_3: "",
    WEB_URL: "",
    ACTIVE: 1,
    SHORT_DESC: "",
    LONG_DESCRIPTION: "",
    META_TAGS: "",
    SORT_POSITION: "",
  })

  useEffect(() => {
    fetchCategory()
  }, [params.id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/catalog/categories/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch category")
      const data = await response.json()
      setCategory(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load category",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/catalog/categories/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      })

      if (!response.ok) throw new Error("Failed to update category")

      toast({
        title: "Success",
        description: "Category updated successfully",
      })
      router.push("/admin/catalog/categories")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
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
        <h1 className="text-2xl font-bold">Edit Category</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dept">Department</Label>
            <Input
              id="dept"
              value={category.DEPT}
              onChange={(e) =>
                setCategory({ ...category, DEPT: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="typ">Type</Label>
            <Input
              id="typ"
              value={category.TYP}
              onChange={(e) => setCategory({ ...category, TYP: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subtyp1">Subtype 1</Label>
            <Input
              id="subtyp1"
              value={category.SUBTYP_1}
              onChange={(e) =>
                setCategory({ ...category, SUBTYP_1: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subtyp2">Subtype 2</Label>
            <Input
              id="subtyp2"
              value={category.SUBTYP_2}
              onChange={(e) =>
                setCategory({ ...category, SUBTYP_2: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subtyp3">Subtype 3</Label>
            <Input
              id="subtyp3"
              value={category.SUBTYP_3}
              onChange={(e) =>
                setCategory({ ...category, SUBTYP_3: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="webUrl">Web URL</Label>
            <Input
              id="webUrl"
              value={category.WEB_URL}
              onChange={(e) =>
                setCategory({ ...category, WEB_URL: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortDesc">Short Description</Label>
            <Textarea
              id="shortDesc"
              value={category.SHORT_DESC}
              onChange={(e) =>
                setCategory({ ...category, SHORT_DESC: e.target.value })
              }
              placeholder="Enter short description"
              className="min-h-[150px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="longDesc">Long Description</Label>
            <Textarea
              id="longDesc"
              value={category.LONG_DESCRIPTION}
              onChange={(e) =>
                setCategory({ ...category, LONG_DESCRIPTION: e.target.value })
              }
              placeholder="Enter long description"
              className="min-h-[150px] px-4 text-base border border-gray-300 bg-gray-50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={category.ACTIVE === 1}
              onChange={(e) =>
                setCategory({ ...category, ACTIVE: e.target.checked ? 1 : 0 })
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
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
} 