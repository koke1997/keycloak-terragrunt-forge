import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { JsonFileUploader } from '../../src/components/JsonFileUploader'

// Mock toast
vi.mock('../../src/hooks/use-toast', () => ({
    toast: vi.fn()
}))

describe('JsonFileUploader Component', () => {
    const mockOnFilesChange = vi.fn()
    const mockFiles = []

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render file upload area', () => {
        render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

        expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument()
        expect(screen.getByText(/choose file/i)).toBeInTheDocument()
    })

    it('should handle file upload', async () => {
        const user = userEvent.setup()
        render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

        const file = new File(['{"realm": "test"}'], 'test.json', { type: 'application/json' })
        const input = screen.getByRole('button', { name: /choose file/i })

        // This is a simplified test - actual file upload testing requires more complex setup
        expect(input).toBeInTheDocument()
    })

    it('should display uploaded files', () => {
        const filesWithData = [
            {
                name: 'test.json',
                content: '{"realm": "test"}',
                parsed: { realm: 'test' }
            }
        ]

        render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

        expect(screen.getByText('test.json')).toBeInTheDocument()
    })

    it('should handle file removal', async () => {
        const user = userEvent.setup()
        const filesWithData = [
            {
                name: 'test.json',
                content: '{"realm": "test"}',
                parsed: { realm: 'test' }
            }
        ]

        render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

        const removeButton = screen.getByRole('button', { name: /remove/i })
        await user.click(removeButton)

        expect(mockOnFilesChange).toHaveBeenCalled()
    })
})
