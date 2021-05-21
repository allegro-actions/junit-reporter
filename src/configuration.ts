import axios from 'axios';
import * as core from '@actions/core';

class Config {
    private static cached: Configuration | null = null;
    private static initialized = false;

    async get(): Promise<Configuration | null> {
        const url = core.getInput('configuration-url');
        if (url) {
            if (!Config.initialized) {
                Config.initialized = true;
                try {
                    const response = await axios.get(url);
                    Config.cached = response.data;
                    core.info('Successfully fetched configuration');
                } catch (e) {
                    core.warning('Unable to fetch configuration from URL in configuration-url param. ' + (e instanceof Error ? e.toString() : ''));
                }
            }
        }
        return Config.cached;
    }
}

export default new Config();

export interface Configuration {
    webhookUrl: string | null
}
