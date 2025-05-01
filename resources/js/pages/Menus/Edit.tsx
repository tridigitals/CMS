import React, { useState, useEffect } from 'react';
import { Head, useForm as useInertiaForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BreadcrumbItem } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional().nullable(),
});

interface Props {
  menu: {
    id: number;
    name: string;
    location: string;
    description?: string | null;
  };
  menus: {
    id: number;
    name: string;
  }[];
}

const Edit = ({ menu, menus }: Props) => {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Menus', href: '/menus' },
    { title: 'Edit Menu', href: `/menus/${menu.id}/edit` },
  ];

  // Use Inertia form for submission
  const inertiaForm = useInertiaForm({
    name: menu.name,
    location: menu.location,
    description: menu.description || '',
  });

  // Use React Hook Form for validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: menu.name,
      location: menu.location,
      description: menu.description || '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    inertiaForm.data.name = values.name;
    inertiaForm.data.location = values.location;
    inertiaForm.data.description = values.description || '';
    
    inertiaForm.put(`/menus/${menu.id}`, {
      onError: (errors) => {
        // Form errors will be handled by the form validation
      },
      onSuccess: () => {
        // Redirect will be handled by the controller
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Menu: ${menu.name}`} />

      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Menu</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Menu name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select menu location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="main">Main Navigation</SelectItem>
                            <SelectItem value="footer">Footer</SelectItem>
                            <SelectItem value="sidebar">Sidebar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Menu description"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={inertiaForm.processing}>
                      Update Menu
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Edit;
