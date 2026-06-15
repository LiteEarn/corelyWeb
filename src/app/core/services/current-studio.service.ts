import { Injectable } from '@angular/core';

/**
 * Serviço para gerenciar o Studio atual do usuário.
 *
 * Implementação temporária para MVP. Futuramente o Studio será obtido do usuário autenticado.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentStudioService {
  // Implementação temporária: retorna um Studio fixo para MVP
  // No futuro, isso será obtido do usuário autenticado via AuthService
  private readonly FIXED_STUDIO_ID = '11111111-1111-1111-1111-111111111111';

  constructor() {}

  /**
   * Retorna o ID do Studio atual.
   *
   * @returns ID do Studio atual
   */
  getStudioId(): string {
    return this.FIXED_STUDIO_ID;
  }
}
