# Примеры использования архитектуры

## 📚 Содержание

1. [Создание нового эндпоинта](#создание-нового-эндпоинта)
2. [Работа с типами](#работа-с-типами)
3. [Преобразование данных](#преобразование-данных)
4. [Обработка ошибок](#обработка-ошибок)

---

## 🆕 Создание нового эндпоинта

### Пример: Добавление эндпоинта для заметок (Notes)

#### 1. Создать миграцию БД

```sql
-- migrations/014_create_notes_table.sql
CREATE TABLE IF NOT EXISTS notes (
  id CHAR(36) PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. Добавить типы БД

```typescript
// src/types/database.ts
export interface NoteTable {
  id: string; // CHAR(36) PRIMARY KEY
  userId: string; // CHAR(36) NOT NULL
  title: string; // VARCHAR(255) NOT NULL
  content: string | null; // TEXT
  createdAt: Date; // TIMESTAMP
  updatedAt: Date; // TIMESTAMP
}
```

#### 3. Добавить типы API

```typescript
// src/types/api.ts
export interface NoteDTO {
  id: string;
  title: string;
  content?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoteRequest {
  title: string;
  content?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

export interface GetNotesResponse extends ApiResponse<NoteDTO[]> {}
export interface GetNoteResponse extends ApiResponse<NoteDTO> {}
export interface CreateNoteResponse extends ApiResponse<NoteDTO> {}
export interface UpdateNoteResponse extends ApiResponse<NoteDTO> {}
```

#### 4. Добавить DTO

```typescript
// src/types/dto.ts
export interface NoteCreateDTO {
  title: string;
  content?: string;
  userId: string;
}

export interface NoteUpdateDTO {
  title?: string;
  content?: string;
}
```

#### 5. Создать модель

```typescript
// src/models/Note.ts
import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { NoteTable } from '../types/database';
import { NoteCreateDTO, NoteUpdateDTO } from '../types/dto';

export interface INote {
  id?: string;
  title: string;
  content?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class NoteModel {
  private static transformNote(note: any): INote {
    return {
      ...note,
      createdAt: note.createdAt ? new Date(note.createdAt) : undefined,
      updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined,
    };
  }

  static async find(filter: { userId: string }): Promise<INote[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM notes WHERE userId = ? ORDER BY createdAt DESC',
      [filter.userId]
    );
    return (rows as NoteTable[]).map(this.transformNote);
  }

  static async findById(id: string): Promise<INote | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );
    const notes = rows as NoteTable[];
    return notes[0] ? this.transformNote(notes[0]) : null;
  }

  static async create(data: NoteCreateDTO): Promise<INote> {
    const id = uuidv4();
    await pool.execute(
      'INSERT INTO notes (id, userId, title, content) VALUES (?, ?, ?, ?)',
      [id, data.userId, data.title, data.content || null]
    );
    return this.transformNote({ ...data, id });
  }

  static async findByIdAndUpdate(
    id: string, 
    data: NoteUpdateDTO
  ): Promise<INote | null> {
    const sets: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (sets.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE notes SET ${sets.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async findByIdAndDelete(id: string): Promise<void> {
    await pool.execute('DELETE FROM notes WHERE id = ?', [id]);
  }
}

export default NoteModel;
```

#### 6. Создать контроллер

```typescript
// src/controllers/noteController.ts
import { Request, Response, NextFunction } from 'express';
import Note, { INote } from '../models/Note';
import { 
  CreateNoteRequest, 
  UpdateNoteRequest,
  NoteDTO 
} from '../types/api';

// Преобразование Model → DTO
const toDTO = (note: INote): NoteDTO => ({
  id: note.id!,
  title: note.title,
  content: note.content,
  userId: note.userId,
  createdAt: note.createdAt?.toISOString(),
  updatedAt: note.updatedAt?.toISOString(),
});

export const getNotes = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const notes = await Note.find({ userId: req.user?.id || '' });
    const notesDTO = notes.map(toDTO);
    res.status(200).json({ success: true, data: notesDTO });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNote = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note || note.userId !== req.user?.id) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }
    res.status(200).json({ success: true, data: toDTO(note) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createNote = async (
  req: Request<{}, {}, CreateNoteRequest>,
  res: Response,
  _next: NextFunction
) => {
  try {
    const noteData = {
      title: req.body.title,
      content: req.body.content,
      userId: req.user?.id || ''
    };
    const note = await Note.create(noteData);
    res.status(201).json({ success: true, data: toDTO(note) });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateNote = async (
  req: Request<{ id: string }, {}, UpdateNoteRequest>,
  res: Response,
  _next: NextFunction
) => {
  try {
    const existingNote = await Note.findById(req.params.id);
    if (!existingNote || existingNote.userId !== req.user?.id) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }
    const note = await Note.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ success: true, data: toDTO(note!) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNote = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const existingNote = await Note.findById(req.params.id);
    if (!existingNote || existingNote.userId !== req.user?.id) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

#### 7. Создать роуты

```typescript
// src/routes/noteRoutes.ts
import { Router } from 'express';
import { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote 
} from '../controllers/noteController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.route('/').get(getNotes).post(createNote);
router.route('/:id').get(getNote).put(updateNote).delete(deleteNote);

export default router;
```

#### 8. Зарегистрировать роуты

```typescript
// src/index.ts
import noteRoutes from './routes/noteRoutes';

// ...
app.use('/api/notes', noteRoutes);
```

---

## 🔄 Работа с типами

### Преобразование Request → DTO

```typescript
// В контроллере
import { CreateOperationRequest } from '../types/api';
import { OperationCreateDTO } from '../types/dto';

export const createOperation = async (
  req: Request<{}, {}, CreateOperationRequest>,
  res: Response
) => {
  // Преобразование API Request в DTO
  const dto: OperationCreateDTO = {
    title: req.body.title,
    amount: req.body.amount,
    category: req.body.category,
    type: req.body.type,
    userId: req.user?.id || '', // Из контекста запроса
    date: req.body.date || new Date(),
    currency: req.body.currency || 'RUB',
    // ...
  };
  
  const operation = await Operation.create(dto);
  // ...
};
```

### Преобразование Model → DTO

```typescript
// Вспомогательная функция
const toOperationDTO = (op: IOperation): OperationDTO => ({
  id: op.id!,
  title: op.title,
  amount: op.amount,
  category: op.category,
  type: op.type,
  date: new Date(op.date).toISOString(),
  currency: op.currency,
  // ...
});

// Использование
const operations = await Operation.find({ userId });
const operationsDTO = operations.map(toOperationDTO);
res.json({ success: true, data: operationsDTO });
```

---

## ⚠️ Обработка ошибок

### В контроллере

```typescript
export const createOperation = async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    // Валидация
    if (!req.body.title || !req.body.amount) {
      return res.status(400).json({
        success: false,
        message: 'Title and amount are required'
      });
    }

    // Бизнес-логика
    const operation = await Operation.create({ ... });
    
    res.status(201).json({ success: true, data: operation });
  } catch (err: any) {
    // Логирование
    console.error('Error creating operation:', err);
    
    // Ответ клиенту
    res.status(400).json({
      success: false,
      message: err.message || 'Failed to create operation'
    });
  }
};
```

### Глобальная обработка

```typescript
// src/middleware/errorHandler.ts
export default (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};
```

---

## 📝 Best Practices

1. **Всегда типизируйте**: Используйте типы из `src/types/`
2. **Разделяйте слои**: Не смешивайте типы разных слоев
3. **Валидируйте данные**: Проверяйте входные данные перед использованием
4. **Обрабатывайте ошибки**: Всегда обрабатывайте ошибки и возвращайте понятные сообщения
5. **Используйте DTO**: Преобразуйте данные на границах слоев

---

## 🔍 Полезные ссылки

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Архитектура приложения
- [DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md) - Схема БД
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - Документация API
- [src/types/README.md](./src/types/README.md) - Документация типов

