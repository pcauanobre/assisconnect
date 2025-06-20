package com.assisconnect.controller;

import com.assisconnect.entity.Usuario;
import com.assisconnect.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /* ==========================================================
       REGISTRO  – não permite usuário duplicado
       ========================================================== */
    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {

        String login = (usuario.getUsuario() == null) ? "" : usuario.getUsuario().trim();
        if (login.isBlank() || usuario.getSenha() == null || usuario.getSenha().isBlank())
            return ResponseEntity.badRequest().body("Usuário e senha são obrigatórios");

        /* já existe? */
        if (usuarioRepository.existsById(login))        // PK = usuario :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Usuário já cadastrado");

        /* normaliza e salva */
        usuario.setUsuario(login);
        Usuario salvo = usuarioRepository.save(usuario);
        salvo.setSenha(null);                           // nunca devolvemos a senha
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    /* ==========================================================
       LOGIN  (trim + comparação normalizada)
       ========================================================== */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario cred) {

        String login = cred.getUsuario() == null ? "" : cred.getUsuario().trim();
        String senha = cred.getSenha()   == null ? "" : cred.getSenha().trim();

        if (login.isBlank() || senha.isBlank())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        /* busca pelo campo usuario (PK) */
        Optional<Usuario> opt = usuarioRepository.findByUsuario(login);  // ← alterado :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
        if (opt.isEmpty())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        Usuario u = opt.get();
        String dbSenha = (u.getSenha() == null) ? "" : u.getSenha().trim();
        if (!dbSenha.equals(senha))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("erro");

        /* monta DTO sem senha */
        Usuario dto = new Usuario();
        dto.setUsuario(u.getUsuario());
        dto.setEmail(u.getEmail());
        dto.setNome(u.getNome());
        dto.setTelefone(u.getTelefone());
        dto.setFotoUrl(u.getFotoUrl());
        dto.setAdministrador(u.isAdministrador());

        return ResponseEntity.ok(dto);
    }

    /* ==========================================================
       RESETAR SENHA
       ========================================================== */
    @PostMapping("/resetar-senha")
    public ResponseEntity<String> resetarSenha(@RequestBody Map<String, String> dados) {

        String email     = dados.get("email");
        String novaSenha = dados.get("novaSenha");

        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    u.setSenha(novaSenha);
                    usuarioRepository.save(u);
                    return ResponseEntity.ok("Senha atualizada com sucesso");
                })
                .orElseGet(() -> ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Usuário não encontrado"));
    }
}
