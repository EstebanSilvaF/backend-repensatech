import { CreateUniversityDTO } from "../types/university.type";
import { universityRepository } from "../repositories/university.repository";

export const universityService = {
    async getAll() {
      return universityRepository.findAll();
    },
  
    async create(data: CreateUniversityDTO) {
      if (!data.name?.trim())         throw new Error('El nombre es requerido');
      if (!data.email_domain?.trim()) throw new Error('El dominio es requerido');
      if (!data.subscription_start)   throw new Error('La fecha de inicio es requerida');
      if (!data.subscription_end)     throw new Error('La fecha de fin es requerida');
  
      // Limpiar dominio por si mandan "@unal.edu.co" en vez de "unal.edu.co"
      const domain = data.email_domain.replace('@', '').toLowerCase().trim();
  
      const existing = await universityRepository.findByEmailDomain(domain);
      if (existing) throw new Error(`Ya existe una universidad con el dominio ${domain}`);
  
      return universityRepository.create({ ...data, email_domain: domain });
    },
  
    async updateStatus(id: string, status: string) {
      const valid = ['active', 'inactive', 'expired'];
      if (!valid.includes(status)) throw new Error('Estado inválido');
  
      const university = await universityRepository.updateStatus(id, status);
      if (!university) throw new Error('Universidad no encontrada');
      return university;
    },
  };
  