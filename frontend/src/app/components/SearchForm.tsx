"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

// Form şeması
const formSchema = z.object({
  query: z.string().min(2, "Minimum 2 karakter girin"),
  location: z.string().min(2, "Minimum 2 karakter girin"),
  maxResults: z.number().min(5).max(100).default(20),
});

type SearchFormProps = {
  onSearchComplete: (leads: any[]) => void;
};

export function SearchForm({ onSearchComplete }: SearchFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form yapılandırması
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
      location: "",
      maxResults: 20,
    },
  });

  // Form gönderimi
const onSubmit = async (data: any) => {
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  setIsLoading(true);
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response body:", result);

    if (!response.ok) {
      alert("Arama sırasında hata oluştu");
      return;
    }

    setLeads(result.leads);
  } catch (error) {
    console.error('Error:', error);
    alert("Arama sırasında ağ hatası oluştu.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* İşletme Türü Alanı */}
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İşletme Türü</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: tesisatçı, elektrikçi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Konum Alanı */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konum</FormLabel>
                <FormControl>
                  <Input placeholder="Örn: İstanbul, Ankara" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Maksimum Sonuç Alanı */}
          <FormField
            control={form.control}
            name="maxResults"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maksimum Sonuç</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={5}
                    max={100}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Aranıyor..." : "Ara"}
        </Button>
      </form>
    </Form>
  );
}