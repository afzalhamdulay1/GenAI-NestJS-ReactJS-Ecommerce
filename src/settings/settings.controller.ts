import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  async getPublicSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      success: true,
      settings: {
        taxRate: settings.taxRate,
        shippingFee: settings.shippingFee,
        freeShippingThreshold: settings.freeShippingThreshold,
        isTaxEnabled: settings.isTaxEnabled,
        isShippingFeeEnabled: settings.isShippingFeeEnabled,
      },
    };
  }

  @Get('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminSettings() {
    const settings = await this.settingsService.getSettings();
    return {
      success: true,
      settings,
    };
  }

  @Put('admin/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateAdminSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }
}
