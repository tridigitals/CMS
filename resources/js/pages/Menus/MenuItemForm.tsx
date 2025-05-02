import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  url: z.string().min(1, 'URL is required'),
  type: z.enum(['custom', 'page', 'post', 'category']),
  target: z.enum(['_self', '_blank']),
});

interface Props {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
}

const MenuItemForm = ({ onSubmit }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      url: '',
      type: 'custom',
      target: '_self',
    },
  });

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-gray-300">Add Menu Item</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 dark:text-gray-300">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Menu item title"
                      {...field}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="custom" className="dark:text-gray-200">Custom Link</SelectItem>
                      <SelectItem value="page" className="dark:text-gray-200">Page</SelectItem>
                      <SelectItem value="post" className="dark:text-gray-200">Post</SelectItem>
                      <SelectItem value="category" className="dark:text-gray-200">Category</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Menu item URL"
                      {...field}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Open in</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="_self" className="dark:text-gray-200">Same window</SelectItem>
                      <SelectItem value="_blank" className="dark:text-gray-200">New window</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={form.formState.isSubmitting}
            >
              Add Menu Item
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MenuItemForm;
