import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ArrowLeft, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DeleteDataFormData {
  email: string;
  password: string;
}

const DeleteData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<DeleteDataFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: DeleteDataFormData) => {
    setIsDeleting(true);

    try {
      const { data: result, error } = await supabase.functions.invoke('secure-delete-data', {
        body: {
          email: data.email,
          password: data.password,
        },
      });

      if (error) {
        throw error;
      }

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete data",
          variant: "destructive",
        });
        return;
      }

      // Data deleted successfully
      toast({
        title: "Data Cleared",
        description: "All your data has been deleted successfully. Your account remains active.",
      });

      // Redirect to dashboard
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="mb-6 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
              <Trash2 className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Delete All Data
            </CardTitle>
            <CardDescription className="text-gray-600">
              Delete all your data while keeping your account active
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Security notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Security Verification Required</p>
                  <p>Please enter your account credentials to confirm this action.</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-2">This will delete all your data</p>
                  <p className="mb-2">Your account will remain active, but you'll lose:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>All your pets and their profiles</li>
                    <li>All tweets and adventures</li>
                    <li>Pack memberships and messages</li>
                    <li>Sitter and business profiles</li>
                    <li>All photos and interactions</li>
                  </ul>
                  <p className="mt-2 font-medium text-orange-900">You can start fresh after this action.</p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          disabled={isDeleting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          disabled={isDeleting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3 pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting Data...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete All My Data
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/settings')}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeleteData;