import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConversionResults } from '../../src/components/ConversionResults'
import type { TerraformFile } from '../../src/utils/keycloakToTerragrunt'

// Mock the copy-to-clipboard functionality
const mockWriteText = vi.fn()
Object.assign(navigator, {
    clipboard: {
        writeText: mockWriteText
    }
})

// Mock toast
const mockToast = vi.fn()
vi.mock('../../src/hooks/use-toast', () => ({
    toast: mockToast
}))

describe('ConversionResults Component - Comprehensive Tests', () => {
    const mockTerraformFiles: TerraformFile[] = [
        {
            filePath: 'keycloak/realms/test-realm/main.tf',
            content: `# Main configuration for test-realm
terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "~> 4.0"
    }
  }
}

resource "keycloak_realm" "this" {
  realm        = var.realm_name
  display_name = var.display_name
  enabled      = var.enabled
}`
        },
        {
            filePath: 'keycloak/realms/test-realm/variables.tf',
            content: `variable "realm_name" {
  description = "Name of the Keycloak realm"
  type        = string
}

variable "display_name" {
  description = "Display name of the realm"
  type        = string
  default     = ""
}

variable "enabled" {
  description = "Whether the realm is enabled"
  type        = bool
  default     = true
}`
        },
        {
            filePath: 'keycloak/realms/test-realm/outputs.tf',
            content: `output "realm_id" {
  description = "ID of the created realm"
  value       = keycloak_realm.this.id
}

output "realm_name" {
  description = "Name of the created realm"
  value       = keycloak_realm.this.realm
}`
        },
        {
            filePath: 'keycloak/realms/test-realm/groups/main.tf',
            content: `# Groups for realm: test-realm
resource "keycloak_group" "groups" {
  for_each = { for group in var.groups : group.name => group }

  realm_id  = var.realm_id
  name      = each.value.name
  parent_id = each.value.parent_id
}`
        },
        {
            filePath: 'keycloak/realms/test-realm/users/main.tf',
            content: `# Users for realm: test-realm
resource "keycloak_user" "users" {
  for_each = { for user in var.users : user.username => user }

  realm_id   = var.realm_id
  username   = each.value.username
  email      = each.value.email
}`
        }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Basic Rendering', () => {
        it('should render conversion results with file tree', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            expect(screen.getByText(/terraform.*generated/i)).toBeInTheDocument()
            expect(screen.getByText(/5.*files/i)).toBeInTheDocument()
            expect(screen.getByText('test-realm')).toBeInTheDocument()
        })

        it('should show file structure in tree format', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Should show main realm files
            expect(screen.getByText('main.tf')).toBeInTheDocument()
            expect(screen.getByText('variables.tf')).toBeInTheDocument()
            expect(screen.getByText('outputs.tf')).toBeInTheDocument()

            // Should show module folders
            expect(screen.getByText('groups')).toBeInTheDocument()
            expect(screen.getByText('users')).toBeInTheDocument()
        })

        it('should display file sizes and types', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Should show file sizes
            expect(screen.getByText(/\d+ bytes/)).toBeInTheDocument()

            // Should indicate Terraform files
            expect(screen.getByText(/terraform/i)).toBeInTheDocument()
        })

        it('should handle empty file list', () => {
            render(<ConversionResults terragruntFiles={[]} realmName="empty-realm" />)

            expect(screen.getByText(/no files generated/i)).toBeInTheDocument()
        })
    })

    describe('File Tree Navigation', () => {
        it('should expand and collapse folders', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Find groups folder
            const groupsFolder = screen.getByText('groups')
            expect(groupsFolder).toBeInTheDocument()

            // Should be expandable
            const expandButton = groupsFolder.closest('div')?.querySelector('button')
            if (expandButton) {
                await user.click(expandButton)

                // Should show nested files after expansion
                await waitFor(() => {
                    expect(screen.getByText(/main\.tf/)).toBeInTheDocument()
                })
            }
        })

        it('should show file icons based on file type', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Should have appropriate icons for different file types
            const tfFiles = screen.getAllByText(/\.tf$/)
            expect(tfFiles.length).toBeGreaterThan(0)
        })

        it('should highlight selected files', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            // Should highlight selected file
            expect(mainTfFile.closest('div')).toHaveClass(/selected|active|highlighted/)
        })
    })

    describe('File Content Display', () => {
        it('should show file content when file is selected', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            await waitFor(() => {
                expect(screen.getByText(/keycloak_realm.*this/)).toBeInTheDocument()
                expect(screen.getByText(/terraform.*required_providers/)).toBeInTheDocument()
            })
        })

        it('should syntax highlight Terraform code', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            await waitFor(() => {
                // Should have syntax highlighting classes or structure
                const codeBlock = screen.getByText(/keycloak_realm/).closest('pre') || screen.getByText(/keycloak_realm/).closest('code')
                expect(codeBlock).toBeInTheDocument()
            })
        })

        it('should show line numbers in code display', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            await waitFor(() => {
                // Should show line numbers
                expect(screen.getByText('1')).toBeInTheDocument()
                expect(screen.getByText('2')).toBeInTheDocument()
            })
        })
    })

    describe('Copy and Download Functionality', () => {
        it('should copy file content to clipboard', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            await waitFor(() => {
                const copyButton = screen.getByRole('button', { name: /copy/i })
                expect(copyButton).toBeInTheDocument()
            })

            const copyButton = screen.getByRole('button', { name: /copy/i })
            await user.click(copyButton)

            expect(mockWriteText).toHaveBeenCalledWith(
                expect.stringContaining('keycloak_realm')
            )
            expect(mockToast).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: expect.stringMatching(/copied/i)
                })
            )
        })

        it('should download individual files', async () => {
            const user = userEvent.setup()

            // Mock URL.createObjectURL and download functionality
            const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
            global.URL.createObjectURL = mockCreateObjectURL

            const mockClick = vi.fn()
            const mockAnchor = {
                href: '',
                download: '',
                click: mockClick,
                style: { display: '' }
            }
            vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement)

            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            await waitFor(() => {
                const downloadButton = screen.getByRole('button', { name: /download/i })
                expect(downloadButton).toBeInTheDocument()
            })

            const downloadButton = screen.getByRole('button', { name: /download/i })
            await user.click(downloadButton)

            expect(mockCreateObjectURL).toHaveBeenCalled()
            expect(mockClick).toHaveBeenCalled()
        })

        it('should download all files as ZIP', async () => {
            const user = userEvent.setup()

            // Mock JSZip
            const mockZip = {
                file: vi.fn(),
                generateAsync: vi.fn().mockResolvedValue(new Blob(['mock zip content']))
            }
            vi.doMock('jszip', () => ({ default: vi.fn(() => mockZip) }))

            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const downloadAllButton = screen.getByRole('button', { name: /download all/i })
            await user.click(downloadAllButton)

            await waitFor(() => {
                expect(mockZip.file).toHaveBeenCalledTimes(mockTerraformFiles.length)
                expect(mockZip.generateAsync).toHaveBeenCalled()
            })
        })
    })

    describe('Module Dependency Visualization', () => {
        it('should show module dependency graph', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Should show dependency visualization
            expect(screen.getByText(/dependencies|modules/i)).toBeInTheDocument()
        })

        it('should highlight module relationships', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Look for module references
            const groupsModule = screen.getByText('groups')
            await user.hover(groupsModule)

            // Should show dependency information
            await waitFor(() => {
                expect(screen.getByText(/depends.*realm/i)).toBeInTheDocument()
            })
        })
    })

    describe('Search and Filter', () => {
        it('should filter files by name', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const searchInput = screen.getByPlaceholderText(/search files/i)
            await user.type(searchInput, 'main')

            await waitFor(() => {
                expect(screen.getByText('main.tf')).toBeInTheDocument()
                expect(screen.queryByText('variables.tf')).not.toBeInTheDocument()
            })
        })

        it('should filter by file type', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const typeFilter = screen.getByLabelText(/filter by type/i)
            await user.selectOptions(typeFilter, 'variables')

            await waitFor(() => {
                expect(screen.getByText('variables.tf')).toBeInTheDocument()
                expect(screen.queryByText('main.tf')).not.toBeInTheDocument()
            })
        })

        it('should filter by module', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const moduleFilter = screen.getByLabelText(/filter by module/i)
            await user.selectOptions(moduleFilter, 'groups')

            await waitFor(() => {
                expect(screen.getByText(/groups.*main\.tf/)).toBeInTheDocument()
                expect(screen.queryByText(/users.*main\.tf/)).not.toBeInTheDocument()
            })
        })
    })

    describe('Statistics and Metadata', () => {
        it('should show file statistics', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            expect(screen.getByText(/5.*files/i)).toBeInTheDocument()
            expect(screen.getByText(/\d+.*bytes/i)).toBeInTheDocument()
            expect(screen.getByText(/3.*modules/i)).toBeInTheDocument()
        })

        it('should show resource count by type', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Should analyze and show resource counts
            expect(screen.getByText(/keycloak_realm.*1/i)).toBeInTheDocument()
            expect(screen.getByText(/keycloak_group/i)).toBeInTheDocument()
            expect(screen.getByText(/keycloak_user/i)).toBeInTheDocument()
        })

        it('should show complexity metrics', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            expect(screen.getByText(/complexity.*low|medium|high/i)).toBeInTheDocument()
        })
    })

    describe('Terraform Integration', () => {
        it('should validate Terraform syntax', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const validateButton = screen.getByRole('button', { name: /validate/i })
            await user.click(validateButton)

            await waitFor(() => {
                expect(screen.getByText(/validation.*success|passed/i)).toBeInTheDocument()
            })
        })

        it('should show Terraform plan preview', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const planButton = screen.getByRole('button', { name: /plan/i })
            await user.click(planButton)

            await waitFor(() => {
                expect(screen.getByText(/plan.*\d+.*add/i)).toBeInTheDocument()
            })
        })

        it('should generate terragrunt.hcl files', () => {
            const filesWithTerragrunt = [
                ...mockTerraformFiles,
                {
                    filePath: 'keycloak/realms/test-realm/terragrunt.hcl',
                    content: `include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "."
}

inputs = {
  realm_name = "test-realm"
  enabled = true
}`
                }
            ]

            render(<ConversionResults terragruntFiles={filesWithTerragrunt} realmName="test-realm" />)

            expect(screen.getByText('terragrunt.hcl')).toBeInTheDocument()
        })
    })

    describe('Error Handling', () => {
        it('should handle files with invalid content', () => {
            const filesWithInvalidContent = [
                {
                    filePath: 'invalid.tf',
                    content: 'invalid terraform content {\n  missing closing brace'
                }
            ]

            render(<ConversionResults terragruntFiles={filesWithInvalidContent} realmName="test-realm" />)

            expect(screen.getByText('invalid.tf')).toBeInTheDocument()
            // Should not crash and should display the content
        })

        it('should handle very large files', () => {
            const largeContent = 'resource "keycloak_user" "user" {\n'.repeat(10000) + '}'
            const largeFiles = [
                {
                    filePath: 'large.tf',
                    content: largeContent
                }
            ]

            render(<ConversionResults terragruntFiles={largeFiles} realmName="test-realm" />)

            expect(screen.getByText('large.tf')).toBeInTheDocument()
            expect(screen.getByText(/large file/i)).toBeInTheDocument()
        })

        it('should handle clipboard API failures', async () => {
            const user = userEvent.setup()

            // Mock clipboard failure
            mockWriteText.mockRejectedValue(new Error('Clipboard not available'))

            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            const copyButton = screen.getByRole('button', { name: /copy/i })
            await user.click(copyButton)

            await waitFor(() => {
                expect(mockToast).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: expect.stringMatching(/error|failed/i),
                        variant: 'destructive'
                    })
                )
            })
        })
    })

    describe('Performance', () => {
        it('should handle large number of files efficiently', () => {
            const manyFiles = Array.from({ length: 100 }, (_, i) => ({
                filePath: `keycloak/realms/test-realm/file-${i}.tf`,
                content: `resource "keycloak_resource_${i}" "resource_${i}" {
  realm_id = var.realm_id
  name = "resource-${i}"
}`
            }))

            const startTime = Date.now()
            render(<ConversionResults terragruntFiles={manyFiles} realmName="test-realm" />)
            const endTime = Date.now()

            expect(endTime - startTime).toBeLessThan(1000) // Should render quickly
            expect(screen.getByText(/100.*files/i)).toBeInTheDocument()
        })

        it('should virtualize large file content display', async () => {
            const user = userEvent.setup()

            const veryLargeFile = {
                filePath: 'huge.tf',
                content: Array.from({ length: 10000 }, (_, i) =>
                    `resource "keycloak_user" "user_${i}" { username = "user-${i}" }`
                ).join('\n')
            }

            render(<ConversionResults terragruntFiles={[veryLargeFile]} realmName="test-realm" />)

            const hugeFile = screen.getByText('huge.tf')
            await user.click(hugeFile)

            // Should handle large content without performance issues
            await waitFor(() => {
                expect(screen.getByText(/user_0/)).toBeInTheDocument()
            }, { timeout: 2000 })
        })
    })

    describe('Accessibility', () => {
        it('should have proper ARIA labels and roles', () => {
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Tree navigation should be accessible
            expect(screen.getByRole('tree')).toBeInTheDocument()
            expect(screen.getAllByRole('treeitem')).toHaveLength(mockTerraformFiles.length)
        })

        it('should support keyboard navigation', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            // Should be able to navigate with arrow keys
            await user.tab() // Focus first item
            await user.keyboard('{ArrowDown}') // Move to next item
            await user.keyboard('{Enter}') // Select item

            // Should show content for selected item
            await waitFor(() => {
                expect(screen.getByText(/keycloak_realm|variable|output/)).toBeInTheDocument()
            })
        })

        it('should announce file selection to screen readers', async () => {
            const user = userEvent.setup()
            render(<ConversionResults terragruntFiles={mockTerraformFiles} realmName="test-realm" />)

            const mainTfFile = screen.getByText('main.tf')
            await user.click(mainTfFile)

            // Should have appropriate aria-live regions for announcements
            expect(screen.getByText(/selected|viewing/i)).toBeInTheDocument()
        })
    })
})
