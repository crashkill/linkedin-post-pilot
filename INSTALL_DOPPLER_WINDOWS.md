# 🔐 Instalação do Doppler CLI no Windows

## Método 1: Download Direto (Recomendado)

1. **Baixe o executável:**
   - Acesse: https://releases.doppler.com/cli/latest/doppler_windows_amd64.zip
   - Ou use o PowerShell:
   ```powershell
   curl -o doppler.zip https://releases.doppler.com/cli/latest/doppler_windows_amd64.zip
   ```

2. **Extraia e instale:**
   ```powershell
   Expand-Archive doppler.zip -DestinationPath .
   Move-Item doppler.exe C:\Windows\System32\
   ```

3. **Verifique a instalação:**
   ```powershell
   doppler --version
   ```

## Método 2: Via Chocolatey

1. **Instale o Chocolatey primeiro:**
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Instale o Doppler:**
   ```powershell
   choco install doppler
   ```

## Método 3: Via Scoop

1. **Instale o Scoop primeiro:**
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Instale o Doppler:**
   ```powershell
   scoop install doppler
   ```

## Configuração Inicial

1. **Login no Doppler:**
   ```bash
   doppler login
   ```

2. **Configure o projeto:**
   ```bash
   doppler setup
   ```

3. **Teste a configuração:**
   ```bash
   doppler run -- node test-doppler.cjs
   ```

## Executar o Projeto com Doppler

```bash
# Desenvolvimento
doppler run -- npm run dev

# Teste de variáveis
doppler run -- node test-doppler.cjs

# Qualquer comando
doppler run -- <seu-comando>
```

## Troubleshooting

- **Erro de conectividade:** Verifique firewall/proxy
- **Comando não encontrado:** Reinicie o terminal após instalação
- **Permissões:** Execute como administrador se necessário

---

💡 **Dica:** Enquanto instala o Doppler, você pode usar o arquivo `.env` temporariamente para desenvolvimento local.