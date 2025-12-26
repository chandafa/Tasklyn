'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus, Search, Tags, ListChecks, Megaphone, Truck, Plane, BrainCircuit, Lightbulb, Users, PlusCircle } from 'lucide-react';
import { useTasks } from '@/lib/hooks/use-tasks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { useTemplates, Template } from '@/lib/hooks/use-templates';
import { CreateTemplateDialog, TemplateFormData } from './_components/create-template-dialog';
import { useUser } from '@/firebase';

const categoryIcons: Record<string, React.ElementType> = {
    konten: Icons.reports,
    pemasaran: Megaphone,
    logistik: Truck,
    perencanaan: Plane,
    organisasi: BrainCircuit,
    pengembangan: BrainCircuit,
    default: Lightbulb,
};


export default function ExplorePage() {
  const { user } = useUser();
  const exploreBanner = PlaceHolderImages.find(p => p.id === 'explore-banner');
  const { addMultipleTasks } = useTasks();
  const { templates, createTemplate } = useTemplates();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    templates.forEach(template => {
      categories.add(template.category.toLowerCase());
    });
    return ['all', ...Array.from(categories)];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const searchMatch =
        searchQuery.trim() === '' ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryMatch =
        selectedCategory === 'all' ||
        template.category.toLowerCase() === selectedCategory;

      return searchMatch && categoryMatch;
    });
  }, [searchQuery, selectedCategory, templates]);

  const handleUseTemplate = (template: Template) => {
    addMultipleTasks(template.tasks);
  };
  
  const handleCreateTemplate = async (data: TemplateFormData) => {
    await createTemplate(data);
  }

  return (
    <>
    <div className="space-y-8">
      {exploreBanner && (
        <div className="relative h-56 w-full rounded-[1.5rem] overflow-hidden shadow-lg">
          <Image
            src={exploreBanner.imageUrl}
            alt="Explore Banner"
            fill
            className="object-cover"
            data-ai-hint={exploreBanner.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10 flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-4xl font-bold text-white shadow-md">Jelajahi Templat Tugas</h1>
            <p className="mt-2 text-lg text-white/90 max-w-2xl">
              Mulai proyek Anda berikutnya dengan cepat menggunakan templat siap pakai yang dirancang oleh komunitas.
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
         <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Cari templat..."
                className="pl-10 h-11 text-base"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsCreateOpen(true)} disabled={user?.isAnonymous} className="h-11">
                <PlusCircle className="mr-2 h-5 w-5" />
                Buat Templat Baru
            </Button>
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:inline-flex h-auto flex-wrap justify-start">
                {allCategories.map(category => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                        {category}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
            const totalTags = new Set(template.tasks.flatMap(t => t.tags || [])).size;
            const primaryTag = template.category || 'default';
            const Icon = categoryIcons[primaryTag] || categoryIcons.default;
            return (
              <Card key={index} className="flex flex-col group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                     <CardTitle>{template.title}</CardTitle>
                     <div className="p-2.5 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                     </div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                   <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4"/>
                            <span>{template.tasks.length} Tugas</span>
                        </div>
                        {template.authorName && (
                             <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Oleh {template.authorName}</span>
                            </div>
                        )}
                  </div>
                </CardContent>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Gunakan Templat
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Terapkan templat "{template.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ini akan menambahkan {template.tasks.length} tugas baru ke daftar tugas pribadi Anda. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleUseTemplate(template)}>
                          Lanjutkan
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            )
        })}
      </div>
       {filteredTemplates.length === 0 && (
        <div className="text-center col-span-full py-16">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Tidak Ada Templat Ditemukan</h3>
          <p className="mt-2 text-sm text-muted-foreground">Coba kata kunci atau filter yang berbeda.</p>
        </div>
      )}
    </div>
    <CreateTemplateDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreateTemplate={handleCreateTemplate}
    />
    </>
  );
}
