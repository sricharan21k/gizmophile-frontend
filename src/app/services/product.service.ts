import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../model/product/product';
import { ProductVariant } from '../model/product/product-variant';
import { ProductColor } from '../model/product/product-color';
import { ProductPage } from '../model/product/product-page';
import { SearchProduct } from '../model/product/search-product';
import { API_URL } from '../app.constants';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  apiBaseUrl = `${API_URL}:8080/products`;

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiBaseUrl}`);
  }

  // getProductsByType(productType: string): Observable<ProductPage> {
  //   let params = new HttpParams().set('page', 0).set('size', 6);
  //   return this.http.get<ProductPage>(`${this.apiBaseUrl}/${productType}`, {
  //     params,
  //   });
  // }

  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiBaseUrl}/product/${productId}`);
  }

  getProductVariant(variantId: number) {
    return this.http.get<ProductVariant>(
      `${this.apiBaseUrl}/product-variant/${variantId}`
    );
  }
  getProductColor(colorId: number) {
    return this.http.get<ProductColor>(
      `${this.apiBaseUrl}/product-color/${colorId}`
    );
  }

  getProductImage(colorId: number) {
    return `${this.apiBaseUrl}/product-image/${colorId}`;
  }

  getProductsByType(
    type: string,
    pageNumber: number,
    pageSize: number,
    inStock: boolean,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    brands?: string[],
    keyword?: string
  ): Observable<ProductPage> {
    console.log('keyword in service', keyword);

    let params = new HttpParams()
      .set('page', pageNumber)
      .set('size', pageSize)
      .set('inStock', inStock);

    if (sortBy) {
      params = params.set('sort', `${sortBy},${sortOrder}`);
    }
    if (brands && brands.length) {
      params = params.set('brands', JSON.stringify(brands));
    }

    if (keyword) {
      params = params.set('keyword', keyword);
    }

    return this.http.get<ProductPage>(`${this.apiBaseUrl}/${type}`, { params });
  }

  getBrands() {
    return this.http
      .get<Record<string, string[]>>(`${this.apiBaseUrl}/brands`)
      .pipe(map((data) => new Map(Object.entries(data))));
  }

  getAllBrands() {
    return this.http.get<string[]>(`${this.apiBaseUrl}/all-brands`);
  }

  searchProducts(keyword: string): Observable<SearchProduct[]> {
    let params = new HttpParams().set('keyword', keyword);
    console.log('key', keyword);
    return this.http.get<SearchProduct[]>(`${this.apiBaseUrl}/search-all`, {
      params,
    });
  }

  getNewLaunches(): Observable<SearchProduct[]> {
    return this.http.get<SearchProduct[]>(`${this.apiBaseUrl}/new-launches`);
  }
}
