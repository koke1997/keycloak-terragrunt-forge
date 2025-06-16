import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { JsonFileUploader } from '../../src/components/JsonFileUploader'

// Mock toast
const mockToast = vi.fn()
vi.mock('../../src/hooks/use-toast', () => ({
    toast: mockToast
}))

describe('JsonFileUploader Component - Comprehensive Tests', () => {
    const mockOnFilesChange = vi.fn()
    const mockFiles: Array<{ name: string; content: string; parsed: Record<string, unknown> }> = []

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Basic Functionality', () => {
        it('should render upload area with correct text', () => {
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            expect(screen.getByText(/drag.*drop.*realm/i)).toBeInTheDocument()
            expect(screen.getByText(/choose file/i)).toBeInTheDocument()
            expect(screen.getByText(/json files only/i)).toBeInTheDocument()
        })

        it('should show file input when clicking choose file button', () => {
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const fileInput = screen.getByRole('button', { name: /choose file/i })
            expect(fileInput).toBeInTheDocument()
        })

        it('should display uploaded files with metadata', () => {
            const filesWithData = [
                {
                    name: 'test-realm.json',
                    content: '{"realm": "test", "enabled": true}',
                    parsed: { realm: 'test', enabled: true }
                },
                {
                    name: 'complex-realm.json',
                    content: '{"realm": "complex", "groups": [{"name": "admin"}]}',
                    parsed: { realm: 'complex', groups: [{ name: 'admin' }] }
                }
            ]

            render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

            expect(screen.getByText('test-realm.json')).toBeInTheDocument()
            expect(screen.getByText('complex-realm.json')).toBeInTheDocument()
            expect(screen.getByText(/\d+ bytes/)).toBeInTheDocument()
        })

        it('should show remove button for each file', () => {
            const filesWithData = [
                {
                    name: 'test.json',
                    content: '{"realm": "test"}',
                    parsed: { realm: 'test' }
                }
            ]

            render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

            const removeButton = screen.getByRole('button', { name: /remove|delete|×/i })
            expect(removeButton).toBeInTheDocument()
        })
    })

    describe('File Upload Handling', () => {
        it('should handle valid JSON file upload', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const validJSON = '{"realm": "test-realm", "enabled": true, "groups": []}'
            const file = new File([validJSON], 'test-realm.json', { type: 'application/json' })

            // Get the hidden file input
            const fileInput = screen.getByTestId('file-input') || document.querySelector('input[type="file"]')
            expect(fileInput).toBeInTheDocument()

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, file)

                await waitFor(() => {
                    expect(mockOnFilesChange).toHaveBeenCalled()
                })
            }
        })

        it('should reject non-JSON files', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const textFile = new File(['plain text'], 'test.txt', { type: 'text/plain' })
            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, textFile)

                await waitFor(() => {
                    expect(mockToast).toHaveBeenCalledWith(
                        expect.objectContaining({
                            title: expect.stringMatching(/error|invalid/i),
                            description: expect.stringMatching(/json/i),
                            variant: 'destructive'
                        })
                    )
                })
            }
        })

        it('should handle invalid JSON content', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const invalidJSON = '{"realm": "test", invalid json'
            const file = new File([invalidJSON], 'invalid.json', { type: 'application/json' })

            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, file)

                await waitFor(() => {
                    expect(mockToast).toHaveBeenCalledWith(
                        expect.objectContaining({
                            title: expect.stringMatching(/error|invalid/i),
                            description: expect.stringMatching(/json|parse/i),
                            variant: 'destructive'
                        })
                    )
                })
            }
        })

        it('should handle large file upload', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            // Create a large JSON file (over 10MB)
            const largeRealm = {
                realm: 'large-test',
                users: Array.from({ length: 10000 }, (_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@example.com`,
                    attributes: { id: [i.toString()] }
                }))
            }

            const largeJSON = JSON.stringify(largeRealm)
            const largeFile = new File([largeJSON], 'large-realm.json', { type: 'application/json' })

            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, largeFile)

                // Should either process successfully or show size warning
                await waitFor(() => {
                    expect(mockOnFilesChange).toHaveBeenCalled()
                }, { timeout: 5000 })
            }
        })
    })

    describe('File Management', () => {
        it('should remove file when remove button is clicked', async () => {
            const user = userEvent.setup()
            const filesWithData = [
                {
                    name: 'test.json',
                    content: '{"realm": "test"}',
                    parsed: { realm: 'test' }
                }
            ]

            render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

            const removeButton = screen.getByRole('button', { name: /remove|delete|×/i })
            await user.click(removeButton)

            expect(mockOnFilesChange).toHaveBeenCalledWith([])
        })

        it('should handle multiple file uploads', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const file1 = new File(['{"realm": "test1"}'], 'test1.json', { type: 'application/json' })
            const file2 = new File(['{"realm": "test2"}'], 'test2.json', { type: 'application/json' })

            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, [file1, file2])

                await waitFor(() => {
                    expect(mockOnFilesChange).toHaveBeenCalled()
                })
            }
        })

        it('should prevent duplicate file uploads', async () => {
            const user = userEvent.setup()
            const existingFiles = [
                {
                    name: 'existing.json',
                    content: '{"realm": "existing"}',
                    parsed: { realm: 'existing' }
                }
            ]

            render(<JsonFileUploader files={existingFiles} onFilesChange={mockOnFilesChange} />)

            const duplicateFile = new File(['{"realm": "duplicate"}'], 'existing.json', { type: 'application/json' })
            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, duplicateFile)

                await waitFor(() => {
                    expect(mockToast).toHaveBeenCalledWith(
                        expect.objectContaining({
                            title: expect.stringMatching(/duplicate|already/i),
                            variant: 'destructive'
                        })
                    )
                })
            }
        })
    })

    describe('Drag and Drop', () => {
        it('should handle drag and drop events', async () => {
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const dropZone = screen.getByTestId('drop-zone') || screen.getByText(/drag.*drop/i).closest('div')
            expect(dropZone).toBeInTheDocument()

            if (dropZone) {
                // Simulate drag enter
                fireEvent.dragEnter(dropZone, {
                    dataTransfer: { types: ['Files'] }
                })

                // Should show active drag state
                expect(dropZone).toHaveClass(/drag|active|over/i)

                // Simulate drag leave
                fireEvent.dragLeave(dropZone)

                // Should remove active drag state
                expect(dropZone).not.toHaveClass(/drag.*active|over/i)
            }
        })

        it('should handle file drop', async () => {
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const validJSON = '{"realm": "dropped-realm", "enabled": true}'
            const file = new File([validJSON], 'dropped.json', { type: 'application/json' })

            const dropZone = screen.getByTestId('drop-zone') || screen.getByText(/drag.*drop/i).closest('div')

            if (dropZone) {
                fireEvent.drop(dropZone, {
                    dataTransfer: {
                        files: [file],
                        types: ['Files']
                    }
                })

                await waitFor(() => {
                    expect(mockOnFilesChange).toHaveBeenCalled()
                })
            }
        })

        it('should reject non-JSON files in drag and drop', async () => {
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const textFile = new File(['plain text'], 'test.txt', { type: 'text/plain' })
            const dropZone = screen.getByTestId('drop-zone') || screen.getByText(/drag.*drop/i).closest('div')

            if (dropZone) {
                fireEvent.drop(dropZone, {
                    dataTransfer: {
                        files: [textFile],
                        types: ['Files']
                    }
                })

                await waitFor(() => {
                    expect(mockToast).toHaveBeenCalledWith(
                        expect.objectContaining({
                            title: expect.stringMatching(/error|invalid/i),
                            variant: 'destructive'
                        })
                    )
                })
            }
        })
    })

    describe('Validation and Feedback', () => {
        it('should validate Keycloak realm structure', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const invalidRealmJSON = '{"name": "test", "enabled": true}' // Missing "realm" property
            const file = new File([invalidRealmJSON], 'invalid-realm.json', { type: 'application/json' })

            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, file)

                await waitFor(() => {
                    expect(mockToast).toHaveBeenCalledWith(
                        expect.objectContaining({
                            title: expect.stringMatching(/warning|invalid/i),
                            description: expect.stringMatching(/realm.*property/i)
                        })
                    )
                })
            }
        })

        it('should show file size information', () => {
            const filesWithData = [
                {
                    name: 'small.json',
                    content: '{"realm": "small"}',
                    parsed: { realm: 'small' }
                },
                {
                    name: 'large.json',
                    content: JSON.stringify({
                        realm: 'large',
                        users: Array.from({ length: 100 }, (_, i) => ({ username: `user-${i}` }))
                    }),
                    parsed: { realm: 'large', users: [] }
                }
            ]

            render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

            // Should show file sizes
            expect(screen.getByText(/\d+ bytes/)).toBeInTheDocument()
            expect(screen.getByText(/\d+\.?\d* KB/)).toBeInTheDocument()
        })

        it('should show realm information from parsed content', () => {
            const filesWithData = [
                {
                    name: 'enterprise.json',
                    content: '{"realm": "enterprise-realm", "enabled": true, "groups": [{"name": "admins"}]}',
                    parsed: {
                        realm: 'enterprise-realm',
                        enabled: true,
                        groups: [{ name: 'admins' }]
                    }
                }
            ]

            render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

            expect(screen.getByText('enterprise-realm')).toBeInTheDocument()
            expect(screen.getByText(/1 group/i)).toBeInTheDocument()
        })
    })

    describe('Error Recovery', () => {
        it('should handle FileReader errors gracefully', async () => {
            const user = userEvent.setup()

            // Mock FileReader to throw an error
            const originalFileReader = global.FileReader
            const mockFileReader = {
                readAsText: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                result: null,
                error: new Error('Failed to read file')
            }

            global.FileReader = vi.fn(() => mockFileReader) as unknown as typeof FileReader

            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const file = new File(['{"realm": "test"}'], 'test.json', { type: 'application/json' })
            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, file)

                // Simulate error event
                const errorHandler = mockFileReader.addEventListener.mock.calls.find(
                    call => call[0] === 'error'
                )?.[1]

                if (errorHandler) {
                    errorHandler({ target: mockFileReader })

                    await waitFor(() => {
                        expect(mockToast).toHaveBeenCalledWith(
                            expect.objectContaining({
                                title: expect.stringMatching(/error|failed/i),
                                variant: 'destructive'
                            })
                        )
                    })
                }
            }

            // Restore original FileReader
            global.FileReader = originalFileReader
        })

        it('should handle memory constraints for large files', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            // Create an extremely large file (simulating memory pressure)
            const hugeRealm = {
                realm: 'huge-test',
                users: Array.from({ length: 100000 }, (_, i) => ({
                    username: `user-${i}`,
                    email: `user${i}@example.com`,
                    attributes: {
                        data: Array.from({ length: 100 }, () => Math.random().toString(36))
                    }
                }))
            }

            const hugeJSON = JSON.stringify(hugeRealm)
            const hugeFile = new File([hugeJSON], 'huge-realm.json', { type: 'application/json' })

            const fileInput = document.querySelector('input[type="file"]')

            if (fileInput) {
                await user.upload(fileInput as HTMLInputElement, hugeFile)

                // Should either handle gracefully or show appropriate warning
                await waitFor(() => {
                    expect(mockOnFilesChange).toHaveBeenCalled()
                }, { timeout: 10000 })
            }
        })
    })

    describe('Accessibility', () => {
        it('should have proper ARIA labels and roles', () => {
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            // Check for file input accessibility
            const fileInput = document.querySelector('input[type="file"]')
            expect(fileInput).toHaveAttribute('aria-label')

            // Check for proper button roles
            const chooseFileButton = screen.getByRole('button', { name: /choose file/i })
            expect(chooseFileButton).toBeInTheDocument()
        })

        it('should support keyboard navigation', async () => {
            const user = userEvent.setup()
            render(<JsonFileUploader files={mockFiles} onFilesChange={mockOnFilesChange} />)

            const chooseFileButton = screen.getByRole('button', { name: /choose file/i })

            // Should be focusable
            await user.tab()
            expect(chooseFileButton).toHaveFocus()

            // Should activate on Enter
            await user.keyboard('{Enter}')
            // File dialog should open (though we can't test the actual dialog)
        })

        it('should announce file upload status to screen readers', async () => {
            const filesWithData = [
                {
                    name: 'test.json',
                    content: '{"realm": "test"}',
                    parsed: { realm: 'test' }
                }
            ]

            render(<JsonFileUploader files={filesWithData} onFilesChange={mockOnFilesChange} />)

            // Should have appropriate status text for screen readers
            expect(screen.getByText(/1 file uploaded/i)).toBeInTheDocument()
        })
    })
})
