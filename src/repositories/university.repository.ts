import { pool } from '../config/db';
import { University, CreateUniversityDTO } from '../types/university.type';

export const universityRepository = {

    async findAll(): Promise<University[]> {
        const result = await pool.query<University>(
            'SELECT * FROM universities ORDER BY name'
        );
        return result.rows;
    },

    async findById(id:string):Promise<University | null> {
        const result = await pool.query<University>(
            'SELECT * FROM universities WHERE id = $1',
            [id]
        );
        return result.rows[0] ?? null;
    },

    async findByEmailDomain(emailDomain:string):Promise<University | null>{
        const result = await pool.query<University>(
            'SELECT * FROM universities WHERE email_domain = $1',
            [emailDomain]
        );
        return result.rows[0] ?? null;
    },

    async create(data: CreateUniversityDTO): Promise<University> {
        const result = await pool.query<University>(
            `INSERT INTO universities (name, email_domain, subscription_start, subscription_end)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [data.name, data.email_domain, data.subscription_start, data.subscription_end]
        );
        return result.rows[0];
    },

    async updateStatus(id: string, status: string): Promise<University | null> {
        const result = await pool.query<University>(
          `UPDATE universities
           SET subscription_status = $1
           WHERE id = $2
           RETURNING *`,
          [status, id]
        );
        return result.rows[0] ?? null;
      }

};