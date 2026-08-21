export interface CreateServiceItemInput {
  categoryId: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  commission: number;
  status?: boolean;
}

export interface SubmitServiceRequestInput {
  serviceId: string;
  inputData: Record<string, any>;
}

export interface CreateProductInput {
  title: string;
  category: string;
  price: number;
  stock: number;
}