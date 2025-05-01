import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
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
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().optional(),
  description: z.string().optional(),
});

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Menus', href: '/menus' },
  { title: 'Create Menu', href: '/menus/create' },
];

const Create = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      location: '',
      description: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    router.post('/menus', values, {
      onError: (errors) => {
        // Extract error message
        let errorMessage = '';
        
        if (errors.location) {
          errorMessage = typeof errors.location === 'string' 
            ? errors.location 
            : Array.isArray(errors.location) 
              ? errors.location[0] 
              : 'A menu with this location already exists. Please choose a different location.';
        } else if (errors.general) {
          errorMessage = typeof errors.general === 'string' 
            ? errors.general 
            : Array.isArray(errors.general) 
              ? errors.general[0] 
              : 'An error occurred while creating the menu.';
        } else {
          errorMessage = Object.values(errors).flat().join('\n');
        }
        
        // Show SweetAlert with error message
        Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      },
      onSuccess: () => {
        // Redirect will be handled by the controller
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Menu" />

      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Menu</CardTitle>
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
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      Create Menu
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

export default Create;
